@extends('emails.layout')

@section('content')
<h1>Payment Reminder - Invoice #{{ $invoice->invoice_number }}</h1>

<p>Hello {{ $customer->name }},</p>

<p>This is a friendly reminder that payment for the following invoice is now overdue:</p>

<div class="info-box" style="border-left-color: #f59e0b;">
    <table style="margin: 0; border: none;">
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Invoice Number:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $invoice->invoice_number }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Invoice Date:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $invoice->invoice_date->format('F j, Y') }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Due Date:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $invoice->due_date->format('F j, Y') }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Days Overdue:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $daysOverdue }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Amount Due:</strong></td>
            <td style="border: none; padding: 4px 0;"><strong>{{ $invoice->currency }} {{ number_format($invoice->total_amount, 2) }}</strong></td>
        </tr>
    </table>
</div>

<p>Please arrange for payment at your earliest convenience. If you have already made this payment, please disregard this reminder.</p>

<p class="text-muted">A copy of the original invoice is attached for your reference.</p>

<p>If you have any questions or need to discuss payment arrangements, please don't hesitate to contact us.</p>

<p>Thank you for your prompt attention to this matter.</p>
@endsection
