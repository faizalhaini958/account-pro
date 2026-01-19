@extends('pdf.layouts.master')

@section('title', 'Receipt #' . $transaction->transaction_id)

@section('content')
    <table class="header-table">
        <tr>
            <td width="50%" style="vertical-align: middle;">
                <div class="logo">
                     <h1 style="margin: 0; color: #1e293b; font-size: 24px;">{{ config('app.name') }}</h1>
                </div>
            </td>
            <td width="50%" style="text-align: right; vertical-align: middle;">
                <table width="100%">
                    <tr>
                        <td class="text-right text-muted uppercase text-xs">Date</td>
                        <td class="text-right text-muted uppercase text-xs" style="padding-left: 20px;">Receipt #</td>
                    </tr>
                    <tr>
                        <td class="text-right font-bold" style="font-size: 14px;">{{ $transaction->created_at->format('F d, Y') }}</td>
                        <td class="text-right font-bold text-primary" style="font-size: 14px;">{{ $transaction->transaction_id }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <div class="info-bg" style="margin-top: 20px;">
        <table class="info-table">
            <tr>
                <td width="50%" style="vertical-align: top; padding-right: 20px;">
                    <div class="text-xs uppercase font-bold text-muted mb-2">Billed To</div>
                    <div class="font-bold text-sm" style="margin-bottom: 2px;">{{ $transaction->user->name }}</div>
                    <div class="text-sm text-muted" style="line-height: 1.4;">
                        {{ $transaction->user->email }}
                    </div>
                </td>
                <td width="50%" style="vertical-align: top; text-align: right; padding-left: 20px;">
                    <div class="text-xs uppercase font-bold text-muted mb-2">Payment Method</div>
                    <div class="font-bold text-sm" style="margin-bottom: 2px;">{{ strtoupper($transaction->gateway) }}</div>
                </td>
            </tr>
        </table>
    </div>

    <table class="items-table" style="margin-top: 30px;">
        <thead>
            <tr>
                <th width="70%">Description</th>
                <th width="30%" class="text-right">Amount ({{ $transaction->currency }})</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <div class="font-bold">Subscription: {{ $transaction->plan->name }}</div> 
                    <div class="text-xs text-muted">Billing Cycle: {{ ucfirst($transaction->plan->billing_cycle ?? 'Monthly') }}</div>
                </td>
                <td class="text-right">{{ number_format($transaction->amount, 2) }}</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td colspan="2" style="border-bottom: 2px solid #475569;"></td>
            </tr>
        </tfoot>
    </table>

    <div class="totals-block">
        <div class="grand-total-box">
            <table width="100%">
                 <tr>
                    <td class="text-left" style="color: white;">Total Paid:</td>
                    <td class="text-right" style="color: white; font-size: 16px;">{{ $transaction->currency }} {{ number_format($transaction->amount, 2) }}</td>
                </tr>
            </table>
        </div>
    </div>
    
    <div style="margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; font-style: italic;">
        Thank you for your business!
    </div>
@endsection
