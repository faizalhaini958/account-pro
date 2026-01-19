<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Models\Tenant;
use App\Models\BankAccount;
use App\Models\JournalEntry;
use App\Models\JournalLine;
use App\Models\ChartOfAccount;
use App\Services\BankReconciliationService;
use App\Services\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BankReconciliationServiceTest extends TestCase
{
    use RefreshDatabase;

    private BankReconciliationService $service;
    private Tenant $tenant;
    private BankAccount $bankAccount;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new BankReconciliationService();
        
        $this->tenant = Tenant::factory()->create();
        TenantContext::setTenant($this->tenant);
        
        $coa = ChartOfAccount::create([
            'tenant_id' => $this->tenant->id,
            'code' => '1001',
            'name' => 'Bank ABC',
            'type' => 'asset'
        ]);

        $this->bankAccount = BankAccount::factory()->create([
            'tenant_id' => $this->tenant->id,
            'account_id' => $coa->id,
            'opening_balance' => 0,
        ]);
    }

    public function test_get_balance_calculates_correctly()
    {
        // Add some journal entries
        $this->createJournalEntry(1000, 0, now()->subDays(2)); // Deposit
        $this->createJournalEntry(0, 200, now()->subDays(1)); // Withdrawal

        $balance = $this->service->getBalance($this->bankAccount);
        
        $this->assertEquals(800.00, $balance);
    }

    public function test_get_unreconciled_transactions_returns_correct_data()
    {
        $this->createJournalEntry(500, 0, now(), 'Deposit 1');
        $this->createJournalEntry(0, 100, now(), 'Withdrawal 1');

        $result = $this->service->getUnreconciledTransactions($this->bankAccount);

        $this->assertCount(2, $result['transactions']);
        $this->assertEquals(400.00, $result['book_balance']);
        
        $tx1 = collect($result['transactions'])->firstWhere('description', 'Deposit 1');
        $this->assertEquals(500, $tx1['debit']);
    }

    public function test_reconcile_calculates_difference_correctly()
    {
        // Book balance: 500 (Deposit 1) - 100 (Withdrawal 1) = 400
        $tx1 = $this->createJournalEntry(500, 0, now(), 'Deposit 1'); // ID 1
        $tx2 = $this->createJournalEntry(0, 100, now(), 'Withdrawal 1'); // ID 2

        // Statement says 500. Meaning 100 withdrawal is not cleared yet.
        // If we only reconcile ID 1 (500), reconciled amount = 500.
        // Difference = Statement (500) - Book (400) = 100.
        
        // Wait, 'reconcile' input logic:
        // statementBalance = what user types from bank statement
        // reconciledTransactionIds = what user checked in UI
        
        // Scenario: Statement Balance = 500. User checks Deposit 1 (500).
        // Book Balance = 400.
        // Reconciled Amount = 500. Unreconciled = -100 (the withdrawal).
        // Difference = Statement (500) - Book (400) = 100.
        
        // The service returns 'difference' as simple math.
        
        // Let's get the IDs of the generated lines (assuming 1 line per entry for bank for simplicity in helper)
        $line1 = JournalLine::where('journal_entry_id', $tx1->id)->where('account_id', $this->bankAccount->account_id)->first();
        
        $result = $this->service->reconcile(
            $this->bankAccount, 
            500.00, 
            now(), 
            [$line1->id]
        );

        $this->assertEquals(500.00, $result['statement_balance']);
        $this->assertEquals(400.00, $result['book_balance']);
        $this->assertEquals(100.00, $result['difference']);
        $this->assertFalse($result['balanced']);
    }

    private function createJournalEntry($debit, $credit, $date, $desc = 'Test')
    {
        $entry = JournalEntry::factory()->create([
            'tenant_id' => $this->tenant->id,
            'date' => $date,
            'description' => $desc,
            'status' => 'posted',
        ]);

        JournalLine::create([
            'journal_entry_id' => $entry->id,
            'account_id' => $this->bankAccount->account_id,
            'type' => $debit > 0 ? 'debit' : 'credit',
            'amount' => $debit > 0 ? $debit : $credit,
            'description' => $desc,
        ]);

        return $entry;
    }
}
