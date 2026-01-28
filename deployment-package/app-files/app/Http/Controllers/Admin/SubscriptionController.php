<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = UserSubscription::with(['user:id,name,email', 'plan:id,name']);

        if ($request->search) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $subscriptions = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($sub) => [
                'id' => $sub->id,
                'user' => $sub->user,
                'plan' => $sub->plan,
                'status' => $sub->status,
                'billing_cycle' => $sub->billing_cycle,
                'price' => $sub->price,
                'is_active' => $sub->isActive(),
                'on_trial' => $sub->onTrial(),
                'starts_at' => $sub->starts_at?->format('Y-m-d'),
                'ends_at' => $sub->ends_at?->format('Y-m-d'),
                'trial_ends_at' => $sub->trial_ends_at?->format('Y-m-d'),
                'created_at' => $sub->created_at->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Admin/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function destroy(UserSubscription $subscription)
    {
        $subscription->cancel();
        return back()->with('success', 'Subscription cancelled successfully.');
    }

    public function resume(UserSubscription $subscription)
    {
        // Simple resume logic: set status to active, maybe clear cancellation date if we had one
        // Assuming 'resume' means setting status back to active if it was cancelled
        if ($subscription->status === 'cancelled') {
            $subscription->update([
                'status' => 'active',
                // strategies for dates: 
                // if it was cancelled but not ended, we just remove cancelled state.
                // if it was expired, we might need to extend it?
                // For now, simple status flip.
            ]);
        }
        return back()->with('success', 'Subscription resumed successfully.');
    }

    public function extend(Request $request, UserSubscription $subscription)
    {
        $request->validate([
            'date' => 'required|date|after:today',
        ]);

        $subscription->update([
            'ends_at' => $request->date,
            'status' => 'active', // If it was expired, reactivate it
        ]);

        return back()->with('success', 'Subscription extended successfully.');
    }
}
