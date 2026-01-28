@extends('pdf.layouts.master')

@section('title', 'Trial Balance')

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
                        <td class="text-right text-muted uppercase text-xs">Report Type</td>
                        <td class="text-right text-muted uppercase text-xs" style="padding-left: 20px;">As Of Date</td>
                    </tr>
                    <tr>
                        <td class="text-right font-bold" style="font-size: 14px;">Trial Balance</td>
                        <td class="text-right font-bold text-primary" style="font-size: 14px;">{{ \Carbon\Carbon::parse($report['as_of_date'])->format('d M Y') }}</td>
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

    {{-- Trial Balance Table --}}
    <table class="items-table" style="margin-top: 20px;">
        <thead>
            <tr>
                <th width="12%">Account Code</th>
                <th width="38%">Account Name</th>
                <th width="15%">Type</th>
                <th width="17%" class="text-right">Debit (RM)</th>
                <th width="18%" class="text-right">Credit (RM)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($report['accounts'] as $account)
                <tr>
                    <td class="text-muted">{{ $account['account_code'] }}</td>
                    <td>{{ $account['account_name'] }}</td>
                    <td>{{ ucfirst($account['account_type']) }}</td>
                    <td class="text-right amount">
                        {{ $account['debit'] > 0 ? number_format($account['debit'], 2) : '-' }}
                    </td>
                    <td class="text-right amount">
                        {{ $account['credit'] > 0 ? number_format($account['credit'], 2) : '-' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center text-muted">No transactions recorded</td>
                </tr>
            @endforelse
        </tbody>
        <tfoot>
            <tr class="grand-total-row">
                <td colspan="3" class="text-right text-bold">TOTALS</td>
                <td class="text-right amount text-bold">{{ number_format($report['total_debit'], 2) }}</td>
                <td class="text-right amount text-bold">{{ number_format($report['total_credit'], 2) }}</td>
            </tr>
        </tfoot>
    </table>

    @if($report['balanced'])
         <div style="margin-top: 30px; text-align: center;">
            <div style="display: inline-block; padding: 10px 20px; background-color: #f0fdf4; border: 1px solid #16a34a; border-radius: 9999px; color: #16a34a; font-weight: bold; font-size: 14px;">
                ✓ Trial Balance is in balance
            </div>
        </div>
    @else
        <div style="margin-top: 20px; padding: 15px; background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; color: #991B1B; text-align: center;">
            <strong style="font-size: 16px;">⚠ Trial Balance is out of balance</strong>
            <div style="margin-top: 5px;">Difference: RM {{ number_format(abs($report['total_debit'] - $report['total_credit']), 2) }}</div>
        </div>
    @endif
    
    <div class="text-xs text-muted text-center mt-8">
        Generated on {{ now()->format('d/m/Y H:i A') }}
    </div>
@endsection
