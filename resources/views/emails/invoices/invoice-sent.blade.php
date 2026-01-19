@extends('emails.layout')

@section('content')
<h1>New Invoice #{{ $invoice->invoice_number }}</h1>

<p>Hello {{ $customer->name }},</p>

<p>Thank you for your business! Please find your invoice details below:</p>

<div class="info-box">
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
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Total Amount:</strong></td>
            <td style="border: none; padding: 4px 0;"><strong>{{ $invoice->currency }} {{ number_format($invoice->total_amount, 2) }}</strong></td>
        </tr>
    </table>
</div>

<p><strong>Items:</strong></p>
<table>
    <thead>
        <tr>
            <th>Description</th>
            <th style="text-align: right;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Amount</th>
        </tr>
    </thead>
    <tbody>
        @foreach($invoice->items as $item)
        <tr>
            <td>{{ $item->description }}</td>
            <td style="text-align: right;">{{ $item->quantity }}</td>
            <td style="text-align: right;">{{ number_format($item->unit_price, 2) }}</td>
            <td style="text-align: right;">{{ number_format($item->amount, 2) }}</td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr>
            <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
            <td style="text-align: right;"><strong>{{ number_format($invoice->subtotal, 2) }}</strong></td>
        </tr>
        @if($invoice->tax_amount > 0)
        <tr>
            <td colspan="3" style="text-align: right;">Tax ({{ $invoice->tax_rate }}%):</td>
            <td style="text-align: right;">{{ number_format($invoice->tax_amount, 2) }}</td>
        </tr>
        @endif
        @if($invoice->discount_amount > 0)
        <tr>
            <td colspan="3" style="text-align: right;">Discount:</td>
            <td style="text-align: right;">-{{ number_format($invoice->discount_amount, 2) }}</td>
        </tr>
        @endif
        <tr>
            <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
            <td style="text-align: right;"><strong>{{ $invoice->currency }} {{ number_format($invoice->total_amount, 2) }}</strong></td>
        </tr>
    </tfoot>
</table>

@if($invoice->notes)
<div class="info-box">
    <p style="margin-bottom: 0;"><strong>Notes:</strong></p>
    <p style="margin-bottom: 0; margin-top: 8px;">{{ $invoice->notes }}</p>
</div>
@endif

<p><strong>Payment Instructions:</strong></p>
<p>Please make payment to the bank account details shown on the attached invoice. Payment is due by {{ $invoice->due_date->format('F j, Y') }}.</p>

<p class="text-muted">A PDF copy of this invoice is attached to this email.</p>

<p>If you have any questions about this invoice, please contact us.</p>

<p>Thank you for your business!</p>
@endsection
