@extends('pdf.layouts.master')

@section('title', 'Payment Voucher ' . $payment->voucher_number)

@section('content')
    {{-- Header Section: Logo & Document Info --}}
    <table class="header-table">
        <tr>
            <td width="50%" style="vertical-align: middle;">
                <div class="logo">
                     @if(isset($tenant) && $tenant && $tenant->logo_path)
                        <img src="{{ public_path('storage/' . $tenant->logo_path) }}" alt="{{ $tenant->name }}" style="max-height: 60px; max-width: 200px;">
                    @else
                        <h1 style="margin: 0; color: #1e293b; font-size: 24px;">{{ $tenant->name ?? config('app.name') }}</h1>
                    @endif
                </div>
            </td>
            <td width="50%" style="text-align: right; vertical-align: middle;">
                <table width="100%">
                    <tr>
                        <td class="text-right text-muted uppercase text-xs">Date</td>
                        <td class="text-right text-muted uppercase text-xs" style="padding-left: 20px;">Voucher #</td>
                    </tr>
                    <tr>
                        <td class="text-right font-bold" style="font-size: 14px;">{{ $payment->date->format('F d, Y') }}</td>
                        <td class="text-right font-bold text-primary" style="font-size: 14px;">{{ $payment->voucher_number }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- Pay To Info --}}
    <div class="info-bg">
        <table class="info-table">
            <tr>
                <td width="100%" style="vertical-align: top;">
                    <div class="text-xs uppercase font-bold text-muted mb-2">Pay To</div>
                    <div class="font-bold text-sm" style="margin-bottom: 2px;">{{ $payment->supplier->name }}</div>
                    
                    <div class="text-sm text-muted" style="line-height: 1.4;">
                         @if($payment->supplier->address)
                            {!! nl2br(e($payment->supplier->address)) !!}<br>
                        @endif
                         @if($payment->supplier->bank_account_number)
                             <div style="margin-top: 5px;">
                                <strong>Bank Account:</strong> {{ $payment->supplier->bank_name }} - {{ $payment->supplier->bank_account_number }}
                             </div>
                        @endif
                    </div>
                </td>
            </tr>
        </table>
    </div>

    {{-- Details Block (Payment Method, Cheque, Etc) --}}
    <div style="margin-bottom: 20px;">
        <table width="100%" style="border-collapse: collapse;">
             <tr>
                <td width="25%" style="padding: 5px 0;">
                    <span class="text-xs text-muted uppercase font-bold">Payment Method</span><br>
                    <span class="text-sm">{{ ucfirst(str_replace('_', ' ', $payment->payment_method ?? 'bank_transfer')) }}</span>
                </td>
                @if($payment->cheque_number)
                <td width="25%" style="padding: 5px 0;">
                    <span class="text-xs text-muted uppercase font-bold">Cheque No</span><br>
                    <span class="text-sm">{{ $payment->cheque_number }}</span>
                </td>
                @endif
                @if($payment->reference)
                 <td width="25%" style="padding: 5px 0;">
                    <span class="text-xs text-muted uppercase font-bold">Reference</span><br>
                    <span class="text-sm">{{ $payment->reference }}</span>
                </td>
                @endif
                 @if($payment->bankAccount)
                 <td width="25%" style="padding: 5px 0;">
                    <span class="text-xs text-muted uppercase font-bold">Paid From</span><br>
                    <span class="text-sm">{{ $payment->bankAccount->bank_name ?? '' }} - {{ $payment->bankAccount->account_number ?? '' }}</span>
                </td>
                @endif
            </tr>
        </table>
    </div>

    {{-- Allocations Table or Amount Details --}}
    @if($payment->allocations && $payment->allocations->count() > 0)
        <div class="text-xs uppercase font-bold text-primary mb-2">Invoice Allocation</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th width="25%">Invoice No.</th>
                    <th width="20%">Invoice Date</th>
                    <th width="20%" class="text-right">Invoice Amount</th>
                    <th width="20%" class="text-right">Amount Paid</th>
                    <th width="15%" class="text-right">Balance</th>
                </tr>
            </thead>
            <tbody>
                @foreach($payment->allocations as $allocation)
                <tr>
                    <td>{{ $allocation->purchaseInvoice->invoice_number }}</td>
                    <td>{{ $allocation->purchaseInvoice->date->format('d/m/Y') }}</td>
                    <td class="text-right">{{ number_format($allocation->purchaseInvoice->total, 2) }}</td>
                    <td class="text-right">{{ number_format($allocation->amount, 2) }}</td>
                    <td class="text-right">{{ number_format($allocation->purchaseInvoice->balance, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
            <tfoot>
                 <tr>
                    <td colspan="5" style="border-bottom: 2px solid {{ $tenant->settings['primary_color'] ?? '#475569' }};"></td>
                </tr>
            </tfoot>
        </table>
    @else
        <div class="info-bg text-center" style="padding: 30px;">
             <span class="text-muted text-sm">Amount:</span><br>
             <strong style="font-size: 20px; color: {{ $tenant->settings['primary_color'] ?? '#475569' }};">{{ $payment->currency ?? 'MYR' }} {{ number_format($payment->amount, 2) }}</strong>
             <br>
             <span class="text-xs text-muted">{{ $amountInWords ?? '' }}</span>
        </div>
    @endif

     {{-- Totals Block (Only if not using big center block, basically always show total) --}}
    @if($payment->allocations && $payment->allocations->count() > 0)
    <div class="totals-block">
        <div class="grand-total-box">
             <table width="100%">
                 <tr>
                    <td class="text-left" style="color: white;">Total Payment:</td>
                    <td class="text-right" style="color: white; font-size: 16px;">{{ number_format($payment->amount, 2) }}</td>
                </tr>
            </table>
        </div>
    </div>
    <div class="clear"></div>
    @endif

    {{-- Notes --}}
    <div style="margin-top: 30px;">
        @if($payment->notes)
        <div class="mb-4">
            <div class="text-xs uppercase font-bold text-primary mb-2">Remarks</div>
            <div class="text-sm text-muted italic">
                {!! nl2br(e($payment->notes)) !!}
            </div>
        </div>
        @endif
    </div>

    {{-- Approval / Signature Section --}}
    <div style="margin-top: 50px; page-break-inside: avoid;">
        <table width="100%" style="border-collapse: collapse;">
            <tr>
                <td width="30%" align="center">
                     <br><br><br>
                    <div style="border-top: 1px solid #cbd5e1; width: 80%; margin: 0 auto; padding-top: 10px;">
                        <strong class="text-sm">Prepared By</strong><br>
                         <span class="text-xs text-muted">{{ $payment->created_by_name ?? '' }}</span>
                    </div>
                </td>
                <td width="30%" align="center">
                     <br><br><br>
                    <div style="border-top: 1px solid #cbd5e1; width: 80%; margin: 0 auto; padding-top: 10px;">
                        <strong class="text-sm">Checked By</strong>
                    </div>
                </td>
                <td width="30%" align="center">
                     <br><br><br>
                    <div style="border-top: 1px solid #cbd5e1; width: 80%; margin: 0 auto; padding-top: 10px;">
                        <strong class="text-sm">Approved By</strong>
                    </div>
                </td>
            </tr>
        </table>
    </div>

@endsection
