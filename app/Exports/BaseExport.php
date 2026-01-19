<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use Illuminate\Support\Collection;

abstract class BaseExport implements FromCollection, WithHeadings, WithTitle, WithStyles, ShouldAutoSize
{
    protected string $title = 'Report';
    protected array $dateRange = [];
    protected ?string $tenantName = null;

    public function __construct(array $dateRange = [], ?string $tenantName = null)
    {
        $this->dateRange = $dateRange;
        $this->tenantName = $tenantName;
    }

    /**
     * Define column headings
     */
    abstract public function headings(): array;

    /**
     * Get the data collection
     */
    abstract public function collection(): Collection;

    /**
     * Sheet title
     */
    public function title(): string
    {
        return $this->title;
    }

    /**
     * Apply styling to the worksheet
     */
    public function styles(Worksheet $sheet): array
    {
        $lastColumn = $sheet->getHighestColumn();
        $lastRow = $sheet->getHighestRow();

        return [
            // Header row styling
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4F46E5'],
                ],
            ],
            // All cells border
            "A1:{$lastColumn}{$lastRow}" => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        'color' => ['rgb' => 'CCCCCC'],
                    ],
                ],
            ],
        ];
    }

    /**
     * Format number as currency
     */
    protected function formatCurrency($value): string
    {
        return number_format((float) $value, 2);
    }

    /**
     * Format date
     */
    protected function formatDate($date): string
    {
        if (!$date) return '-';
        return \Carbon\Carbon::parse($date)->format('d/m/Y');
    }
}
