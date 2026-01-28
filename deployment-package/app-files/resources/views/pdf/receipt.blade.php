@extends('pdf.layouts.master')

@section('title', 'Receipt ' . $receipt->number)

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
                        <td class="text-right text-muted uppercase text-xs" style="padding-left: 20px;">Receipt #</td>
                    </tr>
                    <tr>
                        <td class="text-right font-bold" style="font-size: 14px;">{{ $receipt->date->format('F d, Y') }}</td>
                        <td class="text-right font-bold text-primary" style="font-size: 14px;">{{ $receipt->number }}</td>
                    </tr>
                    <tr>
                        <td colspan="2" class="text-right text-xs text-muted" style="padding-top: 5px;">
                            Payment Method: {{ ucwords(str_replace('_', ' ', $receipt->payment_method)) }}
                            @if($receipt->reference_number)
                                <br>Ref: {{ $receipt->reference_number }}
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- Info Block --}}
    <div class="info-bg">
        <table class="info-table">
            <tr>
                <td width="50%" style="vertical-align: top; padding-right: 20px;">
                    <div class="text-xs uppercase font-bold text-muted mb-2">Received By</div>
                    <div class="font-bold text-sm" style="margin-bottom: 2px;">{{ $tenant->name ?? config('app.name') }}</div>
                    
                    <div class="text-sm text-muted" style="line-height: 1.4;">
                         @if($tenant->address)
                            {!! nl2br(e($tenant->address)) !!}<br>
                        @endif
                        @if($tenant->phone)
                           Phone: {{ $tenant->phone }}<br>
                        @endif
                         @if($tenant->email)
                            Email: {{ $tenant->email }}
                        @endif
                    </div>
                </td>
                <td width="50%" style="vertical-align: top; text-align: right; padding-left: 20px;">
                    <div class="text-xs uppercase font-bold text-muted mb-2">Received From</div>
                    <div class="font-bold text-sm" style="margin-bottom: 2px;">{{ $receipt->customer->name }}</div>
                     <div class="text-sm text-muted" style="line-height: 1.4;">
                         @if($receipt->customer->company_name)
                            {{ $receipt->customer->company_name }}<br>
                        @endif
                         @if($receipt->customer->address)
                            {!! nl2br(e($receipt->customer->address)) !!}<br>
                        @endif
                        @if($receipt->customer->email)
                            {{ $receipt->customer->email }}
                        @endif
                    </div>
                </td>
            </tr>
        </table>
    </div>

    {{-- Items Table --}}
    <table class="items-table">
        <thead>
            <tr>
                <th width="70%">Description</th>
                <th width="30%" class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($receipt->allocations as $allocation)
            <tr>
                <td>
                    <div class="font-bold">Payment for Invoice #{{ $allocation->invoice->number }}</div> 
                </td>
                <td class="text-right">{{ number_format($allocation->amount, 2) }}</td>
            </tr>
            @endforeach
            
            @if($receipt->allocations->isEmpty())
            <tr>
                <td>{{ $receipt->notes ?? 'Payment Received' }}</td>
                <td class="text-right">{{ number_format($receipt->amount, 2) }}</td>
            </tr>
            @endif
        </tbody>
        
        <tfoot>
            <tr>
                <td colspan="2" style="border-bottom: 2px solid {{ $tenant->settings['primary_color'] ?? '#475569' }};"></td>
            </tr>
        </tfoot>
    </table>

    {{-- Totals Block --}}
    <div class="totals-block">
        <div class="grand-total-box">
            <table width="100%">
                 <tr>
                    <td class="text-left" style="color: white;">Total Received:</td>
                    <td class="text-right" style="color: white; font-size: 16px;">{{ number_format($receipt->amount, 2) }}</td>
                </tr>
            </table>
        </div>
    </div>
    
    <div class="clear"></div>

    {{-- Notes --}}
    @if($receipt->notes)
    <div style="margin-top: 40px; width: 60%;">
        <div class="mb-4">
            <div class="text-xs uppercase font-bold text-primary mb-2">Notes</div>
            <div class="text-sm text-muted italic">
                {!! nl2br(e($receipt->notes)) !!}
            </div>
        </div>
    </div>
    @endif
    
    <div style="margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; font-style: italic;">
        Thank you for your payment!
    </div>
@endsection
