@extends('emails.layout')

@section('content')
<h1>e-Invoice Submission Failed</h1>

<p>Hello,</p>

<p>Unfortunately, your e-Invoice submission to LHDN (MyInvois) was rejected.</p>

<div class="info-box" style="border-left-color: #ef4444;">
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
            <td style="border: none; padding: 4px 12px 4px 0;"><strong>Status:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ ucfirst($eInvoiceDocument->status) }}</td>
        </tr>
        @if($eInvoiceDocument->error_message)
        <tr>
            <td style="border: none; padding: 4px 12px 4px 0; vertical-align: top;"><strong>Error:</strong></td>
            <td style="border: none; padding: 4px 0;">{{ $eInvoiceDocument->error_message }}</td>
        </tr>
        @endif
    </table>
</div>

<p><strong>What You Should Do:</strong></p>
<ol style="padding-left: 20px; margin: 16px 0;">
    <li style="margin-bottom: 8px;">Review the error message above</li>
    <li style="margin-bottom: 8px;">Correct the invoice information in your dashboard</li>
    <li style="margin-bottom: 8px;">Resubmit the e-Invoice</li>
</ol>

<a href="{{ route('invoices.edit', $invoice) }}" class="button" style="background-color: #ef4444;">Edit Invoice</a>

<p class="text-muted">Common issues include: invalid TIN/SST numbers, incorrect tax calculations, or missing required fields.</p>

<p>If you need assistance, please contact our support team at support@bukukira.com</p>
@endsection
