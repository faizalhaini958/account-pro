@extends('emails.layout')

@section('content')
<h1>e-Invoice Validated Successfully ✓</h1>

<p>Hello,</p>

<p>Great news! Your e-Invoice has been validated by LHDN (MyInvois) and is now official.</p>

<div class="info-box" style="border-left-color: #22c55e;">
    <table style="margin: 0; border: none;">
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Invoice Number:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $invoice->invoice_number }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>UUID:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $eInvoiceDocument->uuid }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>QR Code:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $eInvoiceDocument->qr_code ? 'Generated' : 'Pending' }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Validated At:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $eInvoiceDocument->validated_at->format('F j, Y g:i A') }}</td>
        </tr>
    </table>
</div>

<p><strong>What's Next:</strong></p>
<ul style="padding-left: 20px; margin: 16px 0;">
    <li style="margin-bottom: 8px;">Your e-Invoice is now legally compliant</li>
    <li style="margin-bottom: 8px;">You can download the validated PDF with QR code</li>
    <li style="margin-bottom: 8px;">Share it with your customer via email or download</li>
</ul>

<a href="{{ route('invoices.show', $invoice) }}" class="button">View Invoice</a>

<p>The validated e-Invoice with LHDN QR code is now available in your dashboard.</p>
@endsection
