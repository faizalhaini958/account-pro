@extends('emails.layout')

@section('content')
<h1>e-Invoice Submitted Successfully</h1>

<p>Hello,</p>

<p>Your e-Invoice has been successfully submitted to LHDN (MyInvois) and is being processed.</p>

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
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Submission ID:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $eInvoiceDocument->submission_id }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Status:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ ucfirst($eInvoiceDocument->status) }}</td>
        </tr>
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Submitted At:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $eInvoiceDocument->submitted_at->format('F j, Y g:i A') }}</td>
        </tr>
    </table>
</div>

<p><strong>Next Steps:</strong></p>
<ul style="padding-left: 20px; margin: 16px 0;">
    <li style="margin-bottom: 8px;">LHDN will process your e-Invoice</li>
    <li style="margin-bottom: 8px;">You'll receive a confirmation once it's validated</li>
    <li style="margin-bottom: 8px;">The validated e-Invoice will be available in your dashboard</li>
</ul>

<p class="text-muted">Processing typically takes a few minutes, but may take longer during peak times.</p>

<p>You can check the status anytime in your BukuKira dashboard under e-Invoice Management.</p>
@endsection
