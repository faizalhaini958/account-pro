<?php

namespace App\Services;

use App\Services\TenantContext;
use Illuminate\Support\Facades\DB;

class NumberingService
{
    /**
     * Generate next number for a document type
     * 
     * @param string $type (invoice, receipt, payment, journal, etc.)
     * @param string|null $prefix Custom prefix (optional)
     * @param int $padding Number of digits to pad
     * @return string
     */
    public function generate(string $type, ?string $prefix = null, int $padding = 5): string
    {
        $tenant = TenantContext::getTenant();
        
        if (!$tenant) {
            throw new \Exception('No active tenant');
        }

        // Get prefix from settings or use default
        $prefix = $prefix ?? $this->getDefaultPrefix($type);
        
        // Get last number for this type and tenant
        $nextNumber = $this->getLastNumber($type, $prefix);
        
        // Generate and verify uniqueness
        do {
            $nextNumber++;
            $formattedNumber = $prefix . str_pad($nextNumber, $padding, '0', STR_PAD_LEFT);
        } while ($this->exists($type, $formattedNumber));
        
        return $formattedNumber;
    }

    /**
     * Check if a number already exists
     */
    protected function exists(string $type, string $number): bool
    {
         $tableName = $this->getTableName($type);
         $columnName = $this->getColumnName($type);
         $tenant = TenantContext::getTenant();

         return DB::table($tableName)
            ->where('tenant_id', $tenant->id)
            ->where($columnName, $number)
            ->exists();
    }

    /**
     * Get the last number used for a document type
     * 
     * @param string $type
     * @param string $prefix
     * @return int
     */
    protected function getLastNumber(string $type, string $prefix): int
    {
        $tenant = TenantContext::getTenant();
        
        // Query the appropriate table based on type
        $tableName = $this->getTableName($type);
        $columnName = $this->getColumnName($type);
        
        $lastRecord = DB::table($tableName)
            ->where('tenant_id', $tenant->id)
            ->where($columnName, 'like', $prefix . '%')
            ->orderByRaw("LENGTH($columnName) DESC")
            ->orderBy($columnName, 'desc')
            ->first();

        if (!$lastRecord) {
            return 0;
        }

        // Extract number from the last record
        $lastValue = $lastRecord->{$columnName};
        $numberPart = str_replace($prefix, '', $lastValue);
        
        return (int) $numberPart;
    }

    /**
     * Get default prefix for document type
     * 
     * @param string $type
     * @return string
     */
    protected function getDefaultPrefix(string $type): string
    {
        $prefixes = [
            'sales_invoice' => 'INV-',
            'purchase_invoice' => 'BILL-',
            'receipt' => 'REC-',
            'payment' => 'PAY-',
            'journal' => 'JE-',
            'quotation' => 'QT-',
            'delivery_order' => 'DO-',
            'credit_note' => 'CN-',
            'expense' => 'EXP-',
        ];

        return $prefixes[$type] ?? 'DOC-';
    }

    /**
     * Get table name for document type
     * 
     * @param string $type
     * @return string
     */
    protected function getTableName(string $type): string
    {
        $tables = [
            'sales_invoice' => 'invoices',
            'invoice' => 'invoices', // Alias
            'purchase_invoice' => 'purchase_invoices',
            'receipt' => 'receipts',
            'payment' => 'supplier_payments',
            'journal' => 'journal_entries',
            'quotation' => 'quotations',
            'delivery_order' => 'delivery_orders',
            'credit_note' => 'credit_notes',
            'expense' => 'expenses',
        ];

        return $tables[$type] ?? 'documents';
    }

    /**
     * Get column name for document number
     * 
     * @param string $type
     * @return string
     */
    protected function getColumnName(string $type): string
    {
        $columns = [
            'sales_invoice' => 'number', // Changed from reference_number to number
            'invoice' => 'number',       // Alias
            'purchase_invoice' => 'number', // Verified in migration: 'number' is the unique system ID
            'receipt' => 'number',
            'payment' => 'number',         // Corrected from voucher_number to number checked in migration
            'journal' => 'entry_number',   // Standard journal column
            'quotation' => 'number',
            'delivery_order' => 'do_number', 
            'credit_note' => 'credit_note_number',
            'expense' => 'number',
        ];

        return $columns[$type] ?? 'number'; // Default to 'number' instead of 'document_number' if safer

        return $columns[$type] ?? 'document_number';
    }

    /**
     * Validate a document number format
     * 
     * @param string $number
     * @param string $type
     * @return bool
     */
    public function validate(string $number, string $type): bool
    {
        $prefix = $this->getDefaultPrefix($type);
        return str_starts_with($number, $prefix);
    }

    /**
     * Get next preview number (without saving)
     * 
     * @param string $type
     * @return string
     */
    public function preview(string $type): string
    {
        return $this->generate($type);
    }
}
