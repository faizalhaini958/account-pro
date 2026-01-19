@extends('pdf.layouts.master')

@section('title', 'Balance Sheet')

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
                        <td class="text-right text-muted uppercase text-xs">Report</td>
                        <td class="text-right text-muted uppercase text-xs" style="padding-left: 20px;">As Of Date</td>
                    </tr>
                    <tr>
                        <td class="text-right font-bold" style="font-size: 14px;">Balance Sheet</td>
                        <td class="text-right font-bold text-primary" style="font-size: 14px;">{{ \Carbon\Carbon::parse($report['as_of_date'])->format('d M Y') }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- Company Info Block --}}
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

    {{-- Assets Section --}}
    <div class="text-sm font-bold text-primary uppercase mb-2 mt-4" style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Assets</div>
    <table class="items-table">
        <thead>
            <tr>
                <th width="15%">Account Code</th>
                <th width="60%">Account Name</th>
                <th width="25%" class="text-right">Amount (RM)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($report['assets']['accounts'] as $account)
                <tr>
                    <td class="text-muted">{{ $account['account_code'] }}</td>
                    <td>{{ $account['account_name'] }}</td>
                    <td class="text-right">{{ number_format($account['amount'], 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="3" class="text-center text-muted">No assets recorded</td>
                </tr>
            @endforelse
            <tr style="background-color: #f8fafc;">
                <td colspan="2" class="text-right font-bold">Total Assets</td>
                <td class="text-right font-bold">{{ number_format($report['assets']['total'], 2) }}</td>
            </tr>
        </tbody>
    </table>

    {{-- Liabilities Section --}}
    <div class="text-sm font-bold text-primary uppercase mb-2 mt-6" style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Liabilities</div>
    <table class="items-table">
        <thead>
            <tr>
                <th width="15%">Account Code</th>
                <th width="60%">Account Name</th>
                <th width="25%" class="text-right">Amount (RM)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($report['liabilities']['accounts'] as $account)
                <tr>
                    <td class="text-muted">{{ $account['account_code'] }}</td>
                    <td>{{ $account['account_name'] }}</td>
                    <td class="text-right">{{ number_format($account['amount'], 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="3" class="text-center text-muted">No liabilities recorded</td>
                </tr>
            @endforelse
            <tr style="background-color: #f8fafc;">
                <td colspan="2" class="text-right font-bold">Total Liabilities</td>
                <td class="text-right font-bold">{{ number_format($report['liabilities']['total'], 2) }}</td>
            </tr>
        </tbody>
    </table>

    {{-- Equity Section --}}
    <div class="text-sm font-bold text-primary uppercase mb-2 mt-6" style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Equity</div>
    <table class="items-table">
        <thead>
            <tr>
                <th width="15%">Account Code</th>
                <th width="60%">Account Name</th>
                <th width="25%" class="text-right">Amount (RM)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($report['equity']['accounts'] as $account)
                <tr>
                    <td class="text-muted">{{ $account['account_code'] }}</td>
                    <td>{{ $account['account_name'] }}</td>
                    <td class="text-right">{{ number_format($account['amount'], 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="3" class="text-center text-muted">No equity recorded</td>
                </tr>
            @endforelse
            <tr style="background-color: #f8fafc;">
                <td colspan="2" class="text-right font-bold">Total Equity</td>
                <td class="text-right font-bold">{{ number_format($report['equity']['total'], 2) }}</td>
            </tr>
        </tbody>
    </table>

    {{-- Grand Total --}}
    <div class="totals-block" style="margin-top: 20px;">
        <div class="grand-total-box">
             <table width="100%">
                 <tr>
                    <td class="text-left" style="color: white;">TOTAL LIABILITIES & EQUITY:</td>
                    <td class="text-right" style="color: white; font-size: 16px;">{{ number_format($report['total_liabilities_and_equity'], 2) }}</td>
                </tr>
            </table>
        </div>
    </div>

    @php
        $difference = abs($report['assets']['total'] - $report['total_liabilities_and_equity']);
    @endphp

    @if($difference > 0.01)
        <div style="margin-top: 20px; padding: 15px; background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; color: #991B1B;">
            <strong>Warning:</strong> Balance sheet is out of balance by RM {{ number_format($difference, 2) }}
        </div>
    @endif
    
    <div class="text-xs text-muted text-center mt-8">
        Generated on {{ now()->format('d/m/Y H:i A') }}
    </div>
@endsection
