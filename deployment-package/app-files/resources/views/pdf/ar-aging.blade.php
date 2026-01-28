@extends('pdf.layouts.master')

@section('title', 'AR Aging Report')

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
                        <td class="text-right font-bold" style="font-size: 14px;">Accounts Receivable Aging</td>
                        <td class="text-right font-bold text-primary" style="font-size: 14px;">{{ now()->format('d M Y') }}</td>
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

    @php
        $categories = [
            'current' => 'Current',
            '1_30' => '1-30 Days Overdue',
            '31_60' => '31-60 Days Overdue',
            '61_90' => '61-90 Days Overdue',
            'over_90' => 'Over 90 Days Overdue',
        ];
    @endphp

    @foreach($categories as $key => $label)
        @if(count($report['aging'][$key] ?? []) > 0)
            <div style="margin-top: 20px; page-break-inside: avoid;">
                <div style="background-color: #f1f5f9; padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 12px; font-weight: bold; display: flex; justify-content: space-between;">
                    <span>{{ $label }}</span>
                    <span>Total: RM {{ number_format($report['totals'][$key], 2) }}</span>
                </div>
                <table class="items-table" style="margin-top: 0;">
                    <thead>
                        <tr>
                            <th width="15%">Invoice #</th>
                            <th width="25%">Customer</th>
                            <th width="15%">Inv Date</th>
                            <th width="15%">Due Date</th>
                            <th width="15%" class="text-right">Days Overdue</th>
                            <th width="15%" class="text-right">Amount (RM)</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($report['aging'][$key] as $invoice)
                            <tr>
                                <td class="text-muted">{{ $invoice['invoice_number'] }}</td>
                                <td>{{ $invoice['customer'] }}</td>
                                <td>{{ $invoice['date'] }}</td>
                                <td>{{ $invoice['due_date'] }}</td>
                                <td class="text-right">{{ $invoice['days_overdue'] }}</td>
                                <td class="text-right amount">{{ number_format($invoice['amount'], 2) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    @endforeach

    @if($report['grand_total'] == 0)
        <div style="padding: 40px; text-align: center; color: #64748b; background-color: #f8fafc; border-radius: 8px; margin-top: 20px;">
            No outstanding receivables as of {{ now()->format('d/m/Y') }}
        </div>
    @endif

    {{-- Summary Table --}}
    <div style="margin-top: 40px; page-break-inside: avoid;">
        <div class="text-sm font-bold text-primary uppercase mb-2" style="border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">Aging Summary</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Aging Category</th>
                    <th class="text-right">Amount (RM)</th>
                    <th class="text-right">% of Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($categories as $key => $label)
                    <tr>
                        <td>{{ $label }}</td>
                        <td class="text-right amount">{{ number_format($report['totals'][$key], 2) }}</td>
                        <td class="text-right">
                            {{ $report['grand_total'] > 0 ? number_format(($report['totals'][$key] / $report['grand_total']) * 100, 1) : 0 }}%
                        </td>
                    </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr class="grand-total-row">
                    <td class="text-bold">TOTAL OUTSTANDING</td>
                    <td class="text-right amount text-bold">{{ number_format($report['grand_total'], 2) }}</td>
                    <td class="text-right text-bold">100%</td>
                </tr>
            </tfoot>
        </table>
    </div>
    
    <div class="text-xs text-muted text-center mt-8">
        Generated on {{ now()->format('d/m/Y H:i A') }}
    </div>
@endsection
