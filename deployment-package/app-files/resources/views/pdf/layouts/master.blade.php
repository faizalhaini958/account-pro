<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>@yield('title', 'Document')</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

        :root {
            /* Shadcn-like Slate Colors */
            --slate-50: #f8fafc;
            --slate-100: #f1f5f9;
            --slate-200: #e2e8f0;
            --slate-300: #cbd5e1;
            --slate-400: #94a3b8;
            --slate-500: #64748b;
            --slate-600: #475569;
            --slate-700: #334155;
            --slate-800: #1e293b;
            --slate-900: #0f172a;

            /* Primary Color (Configurable, defaulting to Slate 600 as requested) */
            --primary: {{ $tenant->settings['primary_color'] ?? '#475569' }};
        }

        body, body * {
            font-family: 'Poppins', sans-serif !important;
        }

        body {
            color: #1e293b; /* slate-800 */
            font-size: 13px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }

        /* Utilities */
        .text-right { text-align: right !important; }
        .text-center { text-align: center !important; }
        .text-left { text-align: left !important; }
        .font-bold { font-weight: 600; }
        .uppercase { text-transform: uppercase; }
        .w-full { width: 100%; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .text-sm { font-size: 12px; }
        .text-xs { font-size: 11px; }
        .text-muted { color: #64748b; /* slate-500 */ }
        .text-primary { color: {{ $tenant->settings['primary_color'] ?? '#475569' }}; }

        /* Structure using Tables for DomPDF stability */
        .header-table {
            width: 100%;
            margin-bottom: 30px;
        }

        .info-bg {
            background-color: #f8fafc; /* slate-50 */
            padding: 20px;
            border-radius: 4px;
            margin-bottom: 30px;
        }

        .info-table {
            width: 100%;
        }

        /* Item Table Design */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .items-table th {
            text-align: left;
            padding: 12px 0;
            color: {{ $tenant->settings['primary_color'] ?? '#475569' }};
            font-weight: 600;
            border-bottom: 2px solid {{ $tenant->settings['primary_color'] ?? '#475569' }}; /* Border color matches primary */
            font-size: 13px;
        }

        .items-table td {
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0; /* slate-200 */
            color: #334155; /* slate-700 */
        }

        .items-table .totals-row td {
            border-bottom: none;
            padding-top: 5px;
            padding-bottom: 5px;
        }

        /* Totals Block */
        .totals-block {
            width: 40%;
            float: right;
        }

        .total-line {
            padding: 5px 0;
            font-weight: 500;
        }

        .grand-total-box {
            background-color: {{ $tenant->settings['primary_color'] ?? '#475569' }};
            color: #ffffff;
            padding: 10px 15px;
            border-radius: 4px;
            margin-top: 10px;
            font-weight: 600;
        }

        /* Helpers */
        .clear { clear: both; }

        @page {
            margin: 40px 50px;
        }

        /* Footer */
        .footer {
            position: fixed;
            bottom: -50px;
            left: 0;
            right: 0;
            height: 50px;
            text-align: center;
            color: #94a3b8; /* slate-400 */
            font-size: 11px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
        }
    </style>
    @yield('styles')
</head>
<body>
    @yield('content')

    <div class="footer">
        @yield('footer')
        {{ isset($tenant) ? $tenant->name : config('app.name') }} | Generated on {{ now()->format('d/m/Y') }}
    </div>
</body>
</html>
