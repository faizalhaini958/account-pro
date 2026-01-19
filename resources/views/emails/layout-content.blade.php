<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'BukuKira' }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f5;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .email-header {
            background-color: #ffffff;
            padding: 32px 40px;
            border-bottom: 1px solid #e4e4e7;
        }
        .email-logo {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 20px;
            font-weight: 600;
            color: #18181b;
        }
        .email-body {
            padding: 40px;
        }
        .email-footer {
            background-color: #fafafa;
            padding: 32px 40px;
            border-top: 1px solid #e4e4e7;
            text-align: center;
            font-size: 14px;
            color: #71717a;
        }
        h1 {
            font-size: 24px;
            font-weight: 600;
            color: #18181b;
            margin-bottom: 16px;
        }
        p {
            margin-bottom: 16px;
            color: #52525b;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #18181b;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 16px 0;
        }
        .button:hover {
            background-color: #27272a;
        }
        .info-box {
            background-color: #f4f4f5;
            border-left: 4px solid #18181b;
            padding: 16px;
            margin: 24px 0;
        }
        .footer-links {
            margin-top: 16px;
        }
        .footer-links a {
            color: #71717a;
            text-decoration: none;
            margin: 0 8px;
        }
        .footer-links a:hover {
            color: #18181b;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e4e4e7;
        }
        th {
            background-color: #f4f4f5;
            font-weight: 600;
            color: #18181b;
        }
        .text-muted {
            color: #71717a;
            font-size: 14px;
        }
        ol, ul {
            padding-left: 20px;
            margin: 16px 0;
        }
        li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Header -->
        <div class="email-header">
            <div class="email-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                BukuKira
            </div>
        </div>

        <!-- Body -->
        <div class="email-body">
            {!! $content !!}
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p style="margin-bottom: 8px;">© {{ date('Y') }} BukuKira. All rights reserved.</p>
            <p class="text-muted" style="margin-bottom: 16px;">Modern accounting software for Malaysian businesses</p>

            <div class="footer-links">
                <a href="{{ config('app.url') }}">Home</a>
                <a href="{{ config('app.url') }}/about">About</a>
                <a href="{{ config('app.url') }}/privacy">Privacy</a>
                <a href="{{ config('app.url') }}/terms">Terms</a>
            </div>
        </div>
    </div>
</body>
</html>
