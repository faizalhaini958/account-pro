@extends('emails.layout')

@section('content')
<h1>Welcome to BukuKira! 🎉</h1>

<p>Hello {{ $user->name }},</p>

<p>Thank you for signing up! Your <strong>{{ $plan->name }}</strong> plan is now active with a <strong>14-day free trial</strong>.</p>

<div class="info-box">
    <table style="margin: 0; border: none;">
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Plan:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $plan->name }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Trial Period:</strong></td>
            <td style="border: none; padding: 4px 0;">14 days</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Trial Ends:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $subscription->trial_ends_at->format('F j, Y') }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Price After Trial:</strong></td>
            <td style="border: none; padding: 4px 0;">RM {{ number_format($subscription->price, 2) }}/{{ $subscription->billing_cycle === 'monthly' ? 'month' : 'year' }}</td>
        </tr>
    </table>
</div>

<p><strong>Get started with these steps:</strong></p>
<ol style="padding-left: 20px; margin: 16px 0;">
    <li style="margin-bottom: 8px;">Complete your company profile settings</li>
    <li style="margin-bottom: 8px;">Set up your Chart of Accounts</li>
    <li style="margin-bottom: 8px;">Add your first customer or supplier</li>
    <li style="margin-bottom: 8px;">Create your first invoice</li>
    <li style="margin-bottom: 8px;">Configure e-Invoice settings for LHDN compliance</li>
</ol>

<a href="{{ route('dashboard') }}" class="button">Go to Dashboard</a>

<p class="text-muted">Your trial will automatically convert to a paid subscription on {{ $subscription->trial_ends_at->format('F j, Y') }} unless you cancel before then.</p>

<p>If you have any questions, our support team is here to help!</p>
@endsection
