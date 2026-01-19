@extends('emails.layout')

@section('content')
<h1>Your Trial is Ending Soon</h1>

<p>Hello {{ $user->name }},</p>

<p>This is a friendly reminder that your <strong>{{ $plan->name }}</strong> plan trial will end in <strong>{{ $daysRemaining }} days</strong>.</p>

<div class="info-box">
    <table style="margin: 0; border: none;">
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Trial Ends:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $subscription->trial_ends_at->format('F j, Y g:i A') }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Next Payment:</strong></td>
            <td style="border: none; padding: 4px 0;">RM {{ number_format($subscription->price, 2) }} on {{ $subscription->ends_at->format('F j, Y') }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Billing Cycle:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ ucfirst($subscription->billing_cycle) }}</td>
        </tr>
    </table>
</div>

<p><strong>What happens next?</strong></p>
<ul style="padding-left: 20px; margin: 16px 0;">
    <li style="margin-bottom: 8px;">Your subscription will automatically continue after the trial</li>
    <li style="margin-bottom: 8px;">You'll be charged RM {{ number_format($subscription->price, 2) }} on {{ $subscription->ends_at->format('F j, Y') }}</li>
    <li style="margin-bottom: 8px;">All your data and settings will remain intact</li>
</ul>

<a href="{{ route('profile.edit') }}#subscription" class="button">Manage Subscription</a>

<p>Want to cancel? You can cancel anytime before {{ $subscription->trial_ends_at->format('F j, Y') }} and you won't be charged.</p>

<p>Thank you for using BukuKira!</p>
@endsection
