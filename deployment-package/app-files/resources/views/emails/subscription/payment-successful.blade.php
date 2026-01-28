@extends('emails.layout')

@section('content')
<h1>Payment Received - Thank You!</h1>

<p>Hello {{ $user->name }},</p>

<p>We've successfully processed your payment for your BukuKira subscription. Thank you for your continued trust!</p>

<div class="info-box">
    <table style="margin: 0; border: none;">
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Transaction ID:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $transaction->transaction_id }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Amount Paid:</strong></td>
            <td style="border: none; padding: 4px 0;">RM {{ number_format($transaction->amount, 2) }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Payment Date:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $transaction->created_at->format('F j, Y g:i A') }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Plan:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $plan->name }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Next Billing Date:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $subscription->ends_at->format('F j, Y') }}</td>
        </tr>
    </table>
</div>

<a href="{{ route('profile.receipt', $transaction) }}" class="button">Download Receipt</a>

<p><strong>Your subscription is now active until {{ $subscription->ends_at->format('F j, Y') }}.</strong></p>

<p>We'll send you a reminder before your next billing date.</p>

<p class="text-muted">If you have any questions about your payment, please don't hesitate to contact our support team.</p>
@endsection
