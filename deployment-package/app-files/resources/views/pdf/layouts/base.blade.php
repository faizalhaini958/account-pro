<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>@yield('title', 'Report')</title>
    <style>
        @include('pdf.partials.styles')
    </style>
    @stack('styles')
</head>
<body>
    <div class="container">
        @include('pdf.partials.header')

        <div class="content">
            @yield('content')
        </div>

        @include('pdf.partials.footer')
    </div>
</body>
</html>
