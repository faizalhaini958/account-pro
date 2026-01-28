@extends('pdf.layouts.master')

@section('title', 'Invoice ' . $invoice->reference_number)

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
                        <td class="text-right text-muted uppercase text-xs" style="padding-left: 20px;">Invoice #</td>
                    </tr>
                    <tr>
                        <td class="text-right font-bold" style="font-size: 14px;">{{ $invoice->date->format('F d, Y') }}</td>
                        <td class="text-right font-bold text-primary" style="font-size: 14px;">{{ $invoice->number }}</td>
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
                    <div class="text-xs uppercase font-bold text-muted mb-2">Supplier</div>
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
                    <div class="text-xs uppercase font-bold text-muted mb-2">Customer</div>
                    <div class="font-bold text-sm" style="margin-bottom: 2px;">{{ $invoice->customer->name }}</div>
                     <div class="text-sm text-muted" style="line-height: 1.4;">
                         @if($invoice->customer->address)
                            {!! nl2br(e($invoice->customer->address)) !!}<br>
                        @endif
                        @if($invoice->customer->phone)
                            {{ $invoice->customer->phone }}<br>
                        @endif
                        @if($invoice->customer->email)
                            {{ $invoice->customer->email }}
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
                <th width="40%">Product Details</th>
                <th width="15%" class="text-right">Price</th>
                <th width="10%" class="text-right">Qty.</th>
                <th width="10%" class="text-center">Tax</th>
                <th width="20%" class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $index => $item)
            <tr>
                <td class="text-center text-muted">{{ $index + 1 }}.</td>
                <td>
                    <div class="font-bold">{{ $item->description }}</div> 
                    {{-- Optional: Description details if any --}}
                </td>
                <td class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                <td class="text-right">{{ $item->quantity }}</td>
                <td class="text-center">{{ $item->tax_percent > 0 ? $item->tax_percent . '%' : '-' }}</td>
                <td class="text-right">{{ number_format($item->total, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
        
        {{-- Table Footer for Layout Spacing if needed --}}
        <tfoot>
            <tr>
                <td colspan="6" style="border-bottom: 2px solid {{ $tenant->settings['primary_color'] ?? '#475569' }};"></td>
            </tr>
        </tfoot>
    </table>

    {{-- Totals Block --}}
    <div class="totals-block">
        <table width="100%">
            <tr>
                 <td class="text-right text-muted total-line">Net Total:</td>
                 <td class="text-right total-line font-bold" style="color: {{ $tenant->settings['primary_color'] ?? '#475569' }};">{{ number_format($invoice->subtotal, 2) }}</td>
            </tr>
            <tr>
                 <td class="text-right text-muted total-line">Tax:</td>
                 <td class="text-right total-line font-bold" style="color: {{ $tenant->settings['primary_color'] ?? '#475569' }};">{{ number_format($invoice->tax_amount, 2) }}</td>
            </tr>
        </table>
        
        <div class="grand-total-box">
            <table width="100%">
                 <tr>
                    <td class="text-left" style="color: white;">Total:</td>
                    <td class="text-right" style="color: white; font-size: 16px;">{{ number_format($invoice->total, 2) }}</td>
                </tr>
            </table>
        </div>
    </div>
    
    <div class="clear"></div>

    {{-- Payment Details & Notes --}}
    <div style="margin-top: 40px; width: 55%;">
        @if(isset($qrCode))
            <div style="float: right; margin-left: 20px;">
                <img src="{{ $qrCode }}" alt="Invoice QR" style="width: 80px; height: 80px; border: 1px solid #e2e8f0; padding: 5px;">
            </div>
        @endif
        
        <div class="mb-6">
            <div class="text-xs uppercase font-bold text-primary mb-2">Payment Details</div>
            <div class="text-sm text-muted">
                {{-- Dynamic Bank Info would appear here --}}
                Please make payment to:<br>
                <strong>{{ $tenant->name }}</strong><br>
                Bank: Maybank<br>
                Account: 1234567890
            </div>
        </div>

        @if($invoice->notes)
        <div>
            <div class="text-xs uppercase font-bold text-primary mb-2">Notes</div>
            <div class="text-sm text-muted italic">
                {!! nl2br(e($invoice->notes)) !!}
            </div>
        </div>
        @endif
        
         {{-- Validation Info --}}
        @if(isset($eInvoiceDocument) && $eInvoiceDocument->uuid)
             <div style="margin-top: 20px; font-size: 10px; color: #16a34a;">
                LHDN Validated: {{ Str::limit($eInvoiceDocument->uuid, 30) }}
            </div>
        @endif
    </div>
@endsection
