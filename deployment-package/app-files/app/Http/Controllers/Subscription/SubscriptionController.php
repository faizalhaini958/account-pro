<?php

namespace App\Http\Controllers\Subscription;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class SubscriptionController extends Controller
{
    /**
     * Cancel the user's subscription.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $subscription = $request->user()->subscription;

        if ($subscription && $subscription->status === 'active') {
            $subscription->update([
                'status' => 'cancelled',
                // We keep ends_at as is, so they enjoy benefits until period end
            ]);

            return back()->with('status', 'subscription-cancelled');
        }

        return back()->with('error', 'No active subscription found.');
    }
}
