<?php

namespace App\Http\Controllers\Subscription;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\PaymentGateway;
use App\Models\SubscriptionPlan;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $subscription = $user->subscription;
        
        // If no subscription, redirect to registration or plans page
        if (!$subscription) {
            return redirect()->route('dashboard'); 
        }

        // Determine the plan to checkout with:
        // 1. Query param 'plan_id' (Change Plan)
        // 2. Current subscription plan (Renewal/Default)
        if ($request->has('plan_id')) {
            $plan = SubscriptionPlan::findOrFail($request->plan_id);
        } else {
            $plan = $subscription->plan;
        }
        
        // Get active gateways
        $gateways = PaymentGateway::active()->get()->map(function ($gateway) {
            return [
                'code' => $gateway->code,
                'name' => $gateway->name,
                'description' => $gateway->description,
                'is_sandbox' => $gateway->is_sandbox,
            ];
        });

        // Determine billable amount and cycle
        // If changing plan, default to monthly for now or allow selection? 
        // For simplicity, let's assume we maintain the current cycle unless specified?
        // Actually, usually changing plan gives a fresh start. Let's default to monthly if not specified, 
        // or just use the plan's defining cycle if possible.
        // For now, let's stick to the subscription's cycle if it exists, otherwise monthly.
        $cycle = $request->query('cycle', $subscription->billing_cycle);
        $amount = $cycle === 'monthly' ? $plan->price_monthly : $plan->price_yearly;

        return Inertia::render('Subscription/Checkout/Index', [
            'plan' => $plan,
            'subscription' => $subscription,
            'gateways' => $gateways,
            'billable_amount' => $amount,
            'billing_cycle' => $cycle,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'gateway' => 'required|exists:payment_gateways,code',
        ]);

        $user = $request->user();
        $subscription = $user->subscription;

        if (!$subscription) {
            return redirect()->route('dashboard');
        }

        $gatewayModel = PaymentGateway::where('code', $validated['gateway'])->firstOrFail();
        $plan = $subscription->plan;
        $amount = $subscription->billing_cycle === 'monthly' ? $plan->price_monthly : $plan->price_yearly;

        try {
            // Simple Factory Logic
            $gatewayService = match ($gatewayModel->code) {
                'chip' => new \App\Services\Payment\ChipGateway($gatewayModel),
                'kipple_pay' => new \App\Services\Payment\KipplePayGateway($gatewayModel),
                default => throw new \Exception('Gateway implementation not found'),
            };

            $result = $gatewayService->createPayment(
                $user, 
                $amount, 
                'MYR', 
                ['plan_id' => $plan->id, 'billing_cycle' => $subscription->billing_cycle]
            );

            // Create local transaction record
            if (isset($result['transaction_id'])) {
                 \App\Models\Transaction::create([
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'gateway' => $gatewayModel->code,
                    'transaction_id' => $result['transaction_id'],
                    'amount' => $amount,
                    'currency' => 'MYR',
                    'status' => 'pending',
                    'metadata' => $result['metadata'] ?? null,
                ]);
            }

            if (isset($result['redirect_url'])) {
                return Inertia::location($result['redirect_url']);
            }

            return back()->with('error', 'Failed to retrieve payment URL.');

        } catch (\Exception $e) {
            return back()->with('error', 'Payment initialization failed: ' . $e->getMessage());
        }
    }
}
