    <table width="100%">
        <tr>
            <td width="30%" style="vertical-align: top;">
                @if(isset($tenant) && $tenant && $tenant->logo_path)
                    <img src="{{ public_path('storage/' . $tenant->logo_path) }}" alt="{{ $tenant->name }}" style="max-height: 80px; max-width: 100%;">
                @elseif(isset($tenant) && $tenant && $tenant->logo_url)
                    <img src="{{ $tenant->logo_url }}" alt="{{ $tenant->name }}" style="max-height: 80px; max-width: 100%;">
                @endif
            </td>
            <td width="70%" style="text-align: right; vertical-align: top;">
                <h1 style="margin: 0; font-size: 24px; color: #1e293b;">{{ $tenant->name ?? config('app.name') }}</h1>
                <div style="font-size: 11px; color: #64748b; margin-top: 5px;">
                    @if($tenant->address)
                        {!! nl2br(e($tenant->address)) !!}<br>
                    @endif
                    
                    @if($tenant->phone)
                        <strong>Tel:</strong> {{ $tenant->phone }}
                    @endif
                    @if($tenant->email)
                        | <strong>Email:</strong> {{ $tenant->email }}
                    @endif
                    
                    @if($tenant->sst_number)
                        <br><strong>SST No:</strong> {{ $tenant->sst_number }}
                    @endif
                    @if($tenant->tin)
                        | <strong>TIN:</strong> {{ $tenant->tin }}
                    @endif
                </div>
            </td>
        </tr>
    </table>
    
    <div style="border-bottom: 2px solid #e2e8f0; margin: 20px 0;"></div>
