<?php

namespace App\Exports;

use App\Models\AuditLog;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AuditLogExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected Collection $logs;

    public function __construct(Collection $logs)
    {
        $this->logs = $logs;
    }

    public function collection(): Collection
    {
        return $this->logs;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Date/Time',
            'User',
            'Event',
            'Model',
            'Record ID',
            'Old Values',
            'New Values',
            'IP Address',
        ];
    }

    public function map($log): array
    {
        return [
            $log->id,
            $log->created_at->format('Y-m-d H:i:s'),
            $log->user?->name ?? 'System',
            $this->getEventLabel($log->event),
            class_basename($log->auditable_type),
            $log->auditable_id,
            $log->old_values ? json_encode($log->old_values, JSON_PRETTY_PRINT) : '',
            $log->new_values ? json_encode($log->new_values, JSON_PRETTY_PRINT) : '',
            $log->ip_address,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FFE0E0E0'],
                ],
            ],
        ];
    }

    protected function getEventLabel(string $event): string
    {
        return match ($event) {
            'created' => 'Created',
            'updated' => 'Updated',
            'deleted' => 'Deleted',
            'restored' => 'Restored',
            'role_changed' => 'Role Changed',
            'added_to_tenant' => 'Added to Tenant',
            'removed_from_tenant' => 'Removed from Tenant',
            'permissions_modified' => 'Permissions Modified',
            'permissions_synced' => 'Permissions Synced',
            default => ucwords(str_replace('_', ' ', $event)),
        };
    }
}
