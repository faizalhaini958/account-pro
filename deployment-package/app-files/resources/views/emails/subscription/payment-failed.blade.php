@extends('emails.layout')

@section('content')
<h1>Payment Failed - Action Required</h1>

<p>Hello {{ $user->name }},</p>

<p>We were unable to process your payment for your BukuKira subscription.</p>

<div class="info-box" style="border-left-color: #ef4444;">
    <table style="margin: 0; border: none;">
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Amount:</strong></td>
            <td style="border: none; padding: 4px 0;">RM {{ number_format($amount, 2) }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Reason:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $reason ?? 'Payment declined' }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Attempted:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ now()->format('F j, Y g:i A') }}</td>
        </tr>
    </table>
</div>

<p><strong>What you should do:</strong></p>
<ol style="padding-left: 20px; margin: 16px 0;">
    <li style="margin-bottom: 8px;">Check that your payment method is valid and has sufficient funds</li>
    <li style="margin-bottom: 8px;">Update your payment information if needed</li>
    <li style="margin-bottom: 8px;">Contact your bank if the issue persists</li>
</ol>

<a href="{{ route('profile.edit') }}#subscription" class="button" style="background-color: #ef4444;">Update Payment Method</a>

<p class="text-muted">We'll automatically retry the payment in 3 days. If all retry attempts fail, your subscription will be cancelled and you'll lose access to your account.</p>

<p>Need help? Contact our support team at support@bukukira.com</p>
@endsection
