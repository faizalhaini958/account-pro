<div class="report-footer">
    <div>
        @if(isset($tenant) && $tenant)
            {{ $tenant->name }}
        @else
            {{ config('app.name') }}
        @endif
        &nbsp;|&nbsp;
        Generated on {{ $generated_at ?? now()->format('d/m/Y H:i') }}
    </div>
    <div class="page-number">
        <script type="text/php">
            if (isset($pdf)) {
                $text = "Page {PAGE_NUM} of {PAGE_COUNT}";
                $font = $fontMetrics->get_font("Helvetica", "normal");
                $size = 9;
                $width = $fontMetrics->get_text_width($text, $font, $size);
                $x = ($pdf->get_width() - $width) / 2;
                $y = $pdf->get_height() - 30;
                $pdf->page_text($x, $y, $text, $font, $size, array(0.58, 0.64, 0.72));
            }
        </script>
    </div>
</div>
