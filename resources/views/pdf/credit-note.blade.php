@extends('pdf.layouts.master')

@section('title', 'Credit Note ' . $creditNote->number)

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
                        <td class="text-right text-muted uppercase text-xs" style="padding-left: 20px;">Credit Note #</td>
                    </tr>
                    <tr>
                        <td class="text-right font-bold" style="font-size: 14px;">{{ $creditNote->date->format('F d, Y') }}</td>
                        <td class="text-right font-bold text-primary" style="font-size: 14px;">{{ $creditNote->number }}</td>
                    </tr>
                    @if($creditNote->invoice)
                    <tr>
                         <td colspan="2" class="text-right text-xs text-muted" style="padding-top: 5px;">
                            Ref Invoice: {{ $creditNote->invoice->number }}
                        </td>
                    </tr>
                    @endif
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
                        @if($tenant->phone)
                           Phone: {{ $tenant->phone }}<br>
                        @endif
                         @if($tenant->email)
                            Email: {{ $tenant->email }}
                        @endif
                    </div>
                </td>
                <td width="50%" style="vertical-align: top; text-align: right; padding-left: 20px;">
                    <div class="text-xs uppercase font-bold text-muted mb-2">Customer</div>
                    <div class="font-bold text-sm" style="margin-bottom: 2px;">{{ $creditNote->customer->name }}</div>
                     <div class="text-sm text-muted" style="line-height: 1.4;">
                         @if($creditNote->customer->company_name)
                            {{ $creditNote->customer->company_name }}<br>
                        @endif
                         @if($creditNote->customer->address)
                            {!! nl2br(e($creditNote->customer->address)) !!}<br>
                        @endif
                        @if($creditNote->customer->phone)
                            {{ $creditNote->customer->phone }}<br>
                        @endif
                        @if($creditNote->customer->email)
                            {{ $creditNote->customer->email }}
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
                <th width="50%">Item</th>
                <th width="15%" class="text-right">Price</th>
                <th width="10%" class="text-right">Qty.</th>
                <th width="20%" class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($creditNote->items as $index => $item)
            <tr>
                <td class="text-center text-muted">{{ $index + 1 }}.</td>
                <td>
                    <div class="font-bold">{{ $item->product->name ?? $item->description }}</div> 
                    @if($item->description && $item->product)
                        <div class="text-xs text-muted">{{ $item->description }}</div>
                    @endif
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
                 <td class="text-right total-line font-bold" style="color: {{ $tenant->settings['primary_color'] ?? '#475569' }};">{{ number_format($creditNote->subtotal, 2) }}</td>
            </tr>
            @if($creditNote->discount_amount > 0)
            <tr>
                 <td class="text-right text-muted total-line">Discount:</td>
                 <td class="text-right total-line font-bold">({{ number_format($creditNote->discount_amount, 2) }})</td>
            </tr>
            @endif
            @if($creditNote->tax_amount > 0)
            <tr>
                 <td class="text-right text-muted total-line">Tax:</td>
                 <td class="text-right total-line font-bold">{{ number_format($creditNote->tax_amount, 2) }}</td>
            </tr>
            @endif
        </table>
        
        <div class="grand-total-box">
            <table width="100%">
                 <tr>
                    <td class="text-left" style="color: white;">Total Refund:</td>
                    <td class="text-right" style="color: white; font-size: 16px;">{{ number_format($creditNote->total, 2) }}</td>
                </tr>
            </table>
        </div>
    </div>
    
    <div class="clear"></div>
    
    {{-- Status Stamp --}}
    @if(in_array($creditNote->status, ['approved', 'refunded']))
        <div style="position: absolute; top: 40%; right: 10%; transform: rotate(-15deg); border: 5px solid {{ $creditNote->status === 'approved' ? '#16a34a' : '#2563eb' }}; color: {{ $creditNote->status === 'approved' ? '#16a34a' : '#2563eb' }}; padding: 10px 20px; font-size: 30px; font-weight: bold; text-transform: uppercase; opacity: 0.3;">
            {{ $creditNote->status }}
        </div>
    @endif

    {{-- Notes & Logic --}}
    <div style="margin-top: 40px; width: 60%;">
        @if($creditNote->notes)
        <div class="mb-4">
            <div class="text-xs uppercase font-bold text-primary mb-2">Notes</div>
            <div class="text-sm text-muted italic">
                {!! nl2br(e($creditNote->notes)) !!}
            </div>
        </div>
        @endif
        
        @if($creditNote->reason)
        <div class="mb-4">
             <div class="text-xs uppercase font-bold text-primary mb-2">Reason</div>
            <div class="text-sm text-muted">
                {!! nl2br(e($creditNote->reason)) !!}
            </div>
        </div>
        @endif
    </div>
@endsection
