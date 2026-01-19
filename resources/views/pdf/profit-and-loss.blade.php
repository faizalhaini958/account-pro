@extends('pdf.layouts.master')

@section('title', 'Profit & Loss Statement')

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
                        <td class="text-right text-muted uppercase text-xs">Report Period</td>
                        <td class="text-right text-muted uppercase text-xs" style="padding-left: 20px;">Type</td>
                    </tr>
                    <tr>
                        <td class="text-right font-bold" style="font-size: 14px;">{{ $report['period']['start'] }} to {{ $report['period']['end'] }}</td>
                        <td class="text-right font-bold text-primary" style="font-size: 14px;">Profit & Loss</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- Company Info --}}
    <div class="info-bg">
        <table class="info-table">
            <tr>
                 <td width="100%" style="vertical-align: top;">
                    <div class="text-xs uppercase font-bold text-muted mb-2">Company</div>
                    <div class="font-bold text-sm" style="margin-bottom: 2px;">{{ $tenant->name ?? config('app.name') }}</div>
                     <div class="text-sm text-muted" style="line-height: 1.4;">
                         @if($tenant->address)
                            {!! nl2br(e($tenant->address)) !!}
                        @endif
                    </div>
                </td>
            </tr>
        </table>
    </div>

    {{-- Income Section --}}
    <div class="text-sm font-bold text-primary uppercase mb-2 mt-4" style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Income</div>
    <table class="items-table">
        <thead>
            <tr>
                <th width="15%">Code</th>
                <th width="60%">Account Name</th>
                <th width="25%" class="text-right">Amount (RM)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($report['income']['accounts'] as $account)
                <tr>
                    <td class="text-muted">{{ $account['account_code'] }}</td>
                    <td>{{ $account['account_name'] }}</td>
                    <td class="text-right">{{ number_format($account['amount'], 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="3" class="text-center text-muted">No income recorded for this period</td>
                </tr>
            @endforelse
            <tr style="background-color: #f8fafc;">
                <td colspan="2" class="text-right font-bold">Total Income</td>
                <td class="text-right font-bold">{{ number_format($report['income']['total'], 2) }}</td>
            </tr>
        </tbody>
    </table>

    {{-- Expenses Section --}}
    <div class="text-sm font-bold text-primary uppercase mb-2 mt-6" style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Expenses</div>
    <table class="items-table">
        <thead>
            <tr>
                <th width="15%">Code</th>
                <th width="60%">Account Name</th>
                <th width="25%" class="text-right">Amount (RM)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($report['expenses']['accounts'] as $account)
                <tr>
                    <td class="text-muted">{{ $account['account_code'] }}</td>
                    <td>{{ $account['account_name'] }}</td>
                    <td class="text-right">{{ number_format($account['amount'], 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="3" class="text-center text-muted">No expenses recorded for this period</td>
                </tr>
            @endforelse
            <tr style="background-color: #f8fafc;">
                <td colspan="2" class="text-right font-bold">Total Expenses</td>
                <td class="text-right font-bold">{{ number_format($report['expenses']['total'], 2) }}</td>
            </tr>
        </tbody>
    </table>

    {{-- Net Profit/Loss --}}
    <div class="totals-block" style="margin-top: 30px;">
        <div class="grand-total-box">
             <table width="100%">
                 <tr>
                    <td class="text-left" style="color: white;">{{ $report['net_profit'] >= 0 ? 'NET PROFIT' : 'NET LOSS' }}:</td>
                    <td class="text-right" style="color: white; font-size: 16px;">{{ number_format(abs($report['net_profit']), 2) }}</td>
                </tr>
            </table>
        </div>
    </div>
    
    <div class="text-xs text-muted text-center mt-8">
        Generated on {{ now()->format('d/m/Y H:i A') }}
    </div>
@endsection
