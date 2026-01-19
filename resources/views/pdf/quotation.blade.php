@extends('pdf.layouts.master')

@section('title', 'Quotation ' . $quotation->number)

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
                        <td class="text-right text-muted uppercase text-xs" style="padding-left: 20px;">Quotation #</td>
                    </tr>
                    <tr>
                        <td class="text-right font-bold" style="font-size: 14px;">{{ $quotation->date->format('F d, Y') }}</td>
                        <td class="text-right font-bold text-primary" style="font-size: 14px;">{{ $quotation->number }}</td>
                    </tr>
                    <tr>
                         <td colspan="2" class="text-right text-xs text-muted" style="padding-top: 5px;">
                            Valid Until: {{ $quotation->valid_until ? $quotation->valid_until->format('d/m/Y') : 'N/A' }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- Supplier & Customer Info Block (Grey Background) --}}
    <div class="info-bg">
        <table class="info-table">
            <tr>
                <td width="50%" style="vertical-align: top; padding-right: 20px;">
                    <div class="text-xs uppercase font-bold text-muted mb-2">From</div>
                    <div class="font-bold text-sm" style="margin-bottom: 2px;">{{ $tenant->name ?? config('app.name') }}</div>
                    
                    <div class="text-sm text-muted" style="line-height: 1.4;">
                         @if($tenant->address)
                            {!! nl2br(e($tenant->address)) !!}<br>
                        @endif
                        @if($tenant->sst_number)
                            SST: {{ $tenant->sst_number }}<br>
                        @endif
                         @if($tenant->tin)
                            TIN: {{ $tenant->tin }}
                        @endif
                    </div>
                </td>
                <td width="50%" style="vertical-align: top; text-align: right; padding-left: 20px;">
                    <div class="text-xs uppercase font-bold text-muted mb-2">Quote For</div>
                    <div class="font-bold text-sm" style="margin-bottom: 2px;">{{ $quotation->customer->name }}</div>
                     <div class="text-sm text-muted" style="line-height: 1.4;">
                         @if($quotation->customer->company_name)
                            {{ $quotation->customer->company_name }}<br>
                        @endif
                         @if($quotation->customer->address)
                            {!! nl2br(e($quotation->customer->address)) !!}<br>
                        @endif
                        @if($quotation->customer->phone)
                            {{ $quotation->customer->phone }}<br>
                        @endif
                        @if($quotation->customer->email)
                            {{ $quotation->customer->email }}
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
                <th width="5%" class="text-center">#</th>
                <th width="45%">Description</th>
                <th width="15%" class="text-right">Price</th>
                <th width="10%" class="text-right">Qty.</th>
                <th width="25%" class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($quotation->items as $index => $item)
            <tr>
                <td class="text-center text-muted">{{ $index + 1 }}.</td>
                <td>
                    <div class="font-bold">{{ $item->description }}</div> 
                </td>
                <td class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                <td class="text-right">{{ $item->quantity }}</td>
                <td class="text-right">{{ number_format($item->total, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
        
        <tfoot>
            <tr>
                <td colspan="5" style="border-bottom: 2px solid {{ $tenant->settings['primary_color'] ?? '#475569' }};"></td>
            </tr>
        </tfoot>
    </table>

    {{-- Totals Block --}}
    <div class="totals-block">
        <table width="100%">
            <tr>
                 <td class="text-right text-muted total-line">Subtotal:</td>
                 <td class="text-right total-line font-bold" style="color: {{ $tenant->settings['primary_color'] ?? '#475569' }};">{{ number_format($quotation->subtotal, 2) }}</td>
            </tr>
            {{-- Add tax row if needed, strictly typically quotes might just be total but matching invoice structure --}}
            {{-- 
            <tr>
                 <td class="text-right text-muted total-line">Tax:</td>
                 <td class="text-right total-line font-bold">{{ number_format($quotation->tax_amount ?? 0, 2) }}</td>
            </tr>
            --}}
        </table>
        
        <div class="grand-total-box">
            <table width="100%">
                 <tr>
                    <td class="text-left" style="color: white;">Total:</td>
                    <td class="text-right" style="color: white; font-size: 16px;">{{ number_format($quotation->total, 2) }}</td>
                </tr>
            </table>
        </div>
    </div>
    
    <div class="clear"></div>
    
    {{-- Status Stamp --}}
    @if(in_array($quotation->status, ['accepted', 'rejected', 'sent']))
        <div style="position: absolute; top: 40%; right: 10%; transform: rotate(-15deg); border: 5px solid {{ $quotation->status === 'accepted' ? '#16a34a' : '#ef4444' }}; color: {{ $quotation->status === 'accepted' ? '#16a34a' : '#ef4444' }}; padding: 10px 20px; font-size: 30px; font-weight: bold; text-transform: uppercase; opacity: 0.3;">
            {{ $quotation->status }}
        </div>
    @endif

    {{-- Notes & Terms --}}
    <div style="margin-top: 40px; width: 60%;">
        @if($quotation->notes)
        <div class="mb-4">
            <div class="text-xs uppercase font-bold text-primary mb-2">Notes</div>
            <div class="text-sm text-muted italic">
                {!! nl2br(e($quotation->notes)) !!}
            </div>
        </div>
        @endif
        
        @if($quotation->terms)
        <div>
             <div class="text-xs uppercase font-bold text-primary mb-2">Terms & Conditions</div>
            <div class="text-sm text-muted" style="font-size: 11px;">
                {!! nl2br(e($quotation->terms)) !!}
            </div>
        </div>
        @endif
    </div>
@endsection
