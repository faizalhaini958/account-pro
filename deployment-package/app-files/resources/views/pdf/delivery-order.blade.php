@extends('pdf.layouts.master')

@section('title', 'Delivery Order ' . $deliveryOrder->number)

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
                        <td class="text-right text-muted uppercase text-xs" style="padding-left: 20px;">Delivery Order #</td>
                    </tr>
                    <tr>
                        <td class="text-right font-bold" style="font-size: 14px;">{{ $deliveryOrder->date->format('F d, Y') }}</td>
                        <td class="text-right font-bold text-primary" style="font-size: 14px;">{{ $deliveryOrder->number }}</td>
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
                    <div class="text-xs uppercase font-bold text-muted mb-2">From</div>
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
                    <div class="text-xs uppercase font-bold text-muted mb-2">Deliver To</div>
                    <div class="font-bold text-sm" style="margin-bottom: 2px;">{{ $deliveryOrder->customer->company_name ?? $deliveryOrder->customer->name }}</div>
                     <div class="text-sm text-muted" style="line-height: 1.4;">
                        @if($deliveryOrder->delivery_address)
                             {!! nl2br(e($deliveryOrder->delivery_address)) !!}
                        @elseif($deliveryOrder->customer->address)
                             {!! nl2br(e($deliveryOrder->customer->address)) !!}
                        @endif
                        <br>
                        @if($deliveryOrder->customer->phone)
                            {{ $deliveryOrder->customer->phone }}<br>
                        @endif
                        @if($deliveryOrder->customer->email)
                            {{ $deliveryOrder->customer->email }}
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
                <th width="75%">Item Description</th>
                <th width="20%" class="text-center">Quantity</th>
            </tr>
        </thead>
        <tbody>
            @foreach($deliveryOrder->items as $index => $item)
            <tr>
                <td class="text-center text-muted">{{ $index + 1 }}.</td>
                <td>
                    <div class="font-bold">{{ $item->product->name ?? $item->description }}</div> 
                    @if($item->description && $item->product)
                        <div class="text-xs text-muted">{{ $item->description }}</div>
                    @endif
                </td>
                <td class="text-center">{{ $item->quantity }}</td>
            </tr>
            @endforeach
        </tbody>
        
        <tfoot>
            <tr>
                <td colspan="3" style="border-bottom: 2px solid {{ $tenant->settings['primary_color'] ?? '#475569' }};"></td>
            </tr>
        </tfoot>
    </table>

    {{-- Notes --}}
    <div style="margin-top: 40px; width: 60%;">
        @if($deliveryOrder->notes)
        <div class="mb-4">
            <div class="text-xs uppercase font-bold text-primary mb-2">Notes</div>
            <div class="text-sm text-muted italic">
                {!! nl2br(e($deliveryOrder->notes)) !!}
            </div>
        </div>
        @endif
    </div>
    
    {{-- Signature Section --}}
    <div style="margin-top: 60px; page-break-inside: avoid;">
        <table width="100%">
            <tr>
                <td width="50%" align="center">
                    <br><br><br>
                    <div style="border-top: 1px solid #cbd5e1; width: 80%; margin: 0 auto; padding-top: 10px;">
                        <strong class="text-sm text-primary">Issued By</strong><br>
                        <span class="text-xs text-muted">{{ $tenant->name ?? config('app.name') }}</span>
                    </div>
                </td>
                <td width="50%" align="center">
                    <br><br><br>
                     <div style="border-top: 1px solid #cbd5e1; width: 80%; margin: 0 auto; padding-top: 10px;">
                        <strong class="text-sm text-primary">Received By</strong><br>
                        <span class="text-xs text-muted">(Signature & Chop)</span>
                    </div>
                </td>
            </tr>
        </table>
    </div>
@endsection
