<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;
use App\Traits\TenantScoped;
use App\Traits\TracksUser;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class CashTransaction extends Model
{
    use SoftDeletes, TenantScoped, TracksUser, Auditable;

    protected $guarded = ['id'];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    protected $appends = ['receipt_url'];

    /**
     * Get the receipt URL attribute
     */
    public function getReceiptUrlAttribute(): ?string
    {
        if ($this->receipt_path) {
            return Storage::url($this->receipt_path);
        }
        return null;
    }

    /**
     * Check if this is a cash sale
     */
    public function isCashSale(): bool
    {
        return $this->type === 'cash_sale';
    }

    /**
     * Check if this is a cash expense
     */
    public function isCashExpense(): bool
    {
        return $this->type === 'cash_expense';
    }

    /**
     * Customer relationship (for cash sales)
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Product relationship (for cash sales)
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Supplier relationship (for cash expenses)
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Expense category relationship (for cash expenses)
     */
    public function expenseCategory(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class);
    }

    /**
     * Bank account relationship
     */
    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }

    /**
     * Journal entry relationship
     */
    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class);
    }

    /**
     * Tenant relationship
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Scope to filter by type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for cash sales only
     */
    public function scopeCashSales($query)
    {
        return $query->where('type', 'cash_sale');
    }

    /**
     * Scope for cash expenses only
     */
    public function scopeCashExpenses($query)
    {
        return $query->where('type', 'cash_expense');
    }
}
