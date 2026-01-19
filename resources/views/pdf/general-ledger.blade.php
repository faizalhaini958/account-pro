@extends('pdf.layouts.master')

@section('title', 'General Ledger')

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
                         <td class="text-right text-muted uppercase text-xs">Report Range</td>
                        <td class="text-right text-muted uppercase text-xs" style="padding-left: 20px;">Range</td>
                    </tr>
                    <tr>
                         <td class="text-right font-bold" style="font-size: 12px;">{{ $report['start_date'] ?? 'N/A' }}</td>
                        <td class="text-right font-bold text-primary" style="font-size: 12px;">to  {{ $report['end_date'] ?? 'N/A' }}</td>
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

    @if(isset($report['account']))
        <div style="margin-top: 20px;">
            {{-- Account Heading --}}
             <div style="background-color: {{ $tenant->settings['primary_color'] ?? '#475569' }}; color: white; padding: 10px 15px; border-radius: 4px 4px 0 0; font-weight: bold;">
                {{ $report['account']->code }} - {{ $report['account']->name }}
            </div>
            
            {{-- Opening Balance Block --}}
             <div style="background-color: #f1f5f9; padding: 10px 15px; border: 1px solid #e2e8f0; border-top: none; font-size: 12px; margin-bottom: 10px;">
                <strong>Opening Balance:</strong>
                RM {{ number_format(abs($report['opening_balance']), 2) }}
                ({{ $report['opening_balance'] >= 0 ? 'Debit' : 'Credit' }})
            </div>

            {{-- Transactions Table --}}
            <table class="items-table">
                <thead>
                    <tr>
                        <th width="12%">Date</th>
                        <th width="12%">Entry #</th>
                        <th width="36%">Description</th>
                        <th width="13%" class="text-right">Debit</th>
                        <th width="13%" class="text-right">Credit</th>
                        <th width="14%" class="text-right">Balance</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                        $runningBalance = $report['opening_balance'];
                    @endphp

                    @forelse($report['lines'] as $line)
                        @php
                            $debit = $line->type === 'debit' ? $line->amount : 0;
                            $credit = $line->type === 'credit' ? $line->amount : 0;
                            $runningBalance += ($debit - $credit);
                        @endphp
                        <tr>
                            <td>{{ $line->journalEntry->date->format('d/m/Y') }}</td>
                            <td>{{ $line->journalEntry->entry_number }}</td>
                            <td>{{ $line->description ?? $line->journalEntry->description }}</td>
                            <td class="text-right amount">
                                {{ $debit > 0 ? number_format($debit, 2) : '-' }}
                            </td>
                            <td class="text-right amount">
                                {{ $credit > 0 ? number_format($credit, 2) : '-' }}
                            </td>
                            <td class="text-right amount">
                                {{ number_format(abs($runningBalance), 2) }}
                                {{ $runningBalance >= 0 ? 'Dr' : 'Cr' }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="text-center text-muted">No transactions for this period</td>
                        </tr>
                    @endforelse
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="text-right text-bold" style="padding-top: 10px;">Closing Balance</td>
                        <td colspan="2"></td>
                        <td class="text-right amount text-bold" style="padding-top: 10px; font-size: 14px;">
                            {{ number_format(abs($runningBalance), 2) }}
                            {{ $runningBalance >= 0 ? 'Dr' : 'Cr' }}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    @else
        <div style="padding: 40px; text-align: center; color: #64748b; background-color: #f8fafc; border-radius: 8px; margin-top: 20px;">
            Please select an account to view the General Ledger
        </div>
    @endif

    <div class="text-xs text-muted text-center mt-8">
        Generated on {{ now()->format('d/m/Y H:i A') }}
    </div>
@endsection
