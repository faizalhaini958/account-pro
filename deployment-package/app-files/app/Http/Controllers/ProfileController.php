<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $subscription = $user->subscription()->with('plan')->first();
        $availablePlans = \App\Models\SubscriptionPlan::where('is_active', true)->get();

        $transactions = $user->paymentTransactions()
            ->latest()
            ->paginate(10)
            ->through(fn ($transaction) => [
                'id' => $transaction->id,
                'date' => $transaction->created_at->format('d M Y, h:i A'),
                'amount' => number_format($transaction->amount, 2),
                'currency' => $transaction->currency,
                'status' => $transaction->status,
                'gateway' => $transaction->gateway,
                'invoice_url' => route('profile.receipt', $transaction->id),
            ]);

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'subscription' => $subscription,
            'transactions' => $transactions,
            'availablePlans' => $availablePlans,
        ]);
    }

    public function receipt(Request $request, $id)
    {
        $transaction = $request->user()->paymentTransactions()
            ->with(['user', 'plan'])
            ->findOrFail($id);

        if ($transaction->status !== 'success') {
            abort(404);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.subscription_receipt', [
            'transaction' => $transaction,
        ]);

        return $pdf->download('receipt-' . $transaction->transaction_id . '.pdf');
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
