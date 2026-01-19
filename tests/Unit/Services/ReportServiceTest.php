<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Models\Tenant;
use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use App\Models\JournalLine;
use App\Models\Invoice;
use App\Models\PurchaseInvoice;
use App\Models\Customer;
use App\Models\Supplier;
use App\Services\ReportService;
use App\Services\TenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class ReportServiceTest extends TestCase
{
    use RefreshDatabase;

    private ReportService $service;
    private Tenant $tenant;
    private $coas;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ReportService();
        
        $this->tenant = Tenant::factory()->create();
        TenantContext::setTenant($this->tenant);
        
        // Setup basic COAs
        $this->coas = [
            'sales' => ChartOfAccount::factory()->create([
                'tenant_id' => $this->tenant->id, 'type' => 'income', 'code' => '4000', 'name' => 'Sales'
            ]),
            'cogs' => ChartOfAccount::factory()->create([
                'tenant_id' => $this->tenant->id, 'type' => 'expense', 'code' => '5000', 'name' => 'COGS'
            ]),
            'bank' => ChartOfAccount::factory()->create([
                'tenant_id' => $this->tenant->id, 'type' => 'asset', 'code' => '1000', 'name' => 'Bank'
            ]),
            'ar' => ChartOfAccount::factory()->create([
                'tenant_id' => $this->tenant->id, 'type' => 'asset', 'code' => '1200', 'name' => 'AR'
            ]),
            'ap' => ChartOfAccount::factory()->create([
                'tenant_id' => $this->tenant->id, 'type' => 'liability', 'code' => '2000', 'name' => 'AP'
            ]),
            'equity' => ChartOfAccount::factory()->create([
                'tenant_id' => $this->tenant->id, 'type' => 'equity', 'code' => '3000', 'name' => 'Capital'
            ]),
        ];
    }

    public function test_profit_and_loss_report()
    {
        // Sales: Credit Income 1000
        $this->createJournalEntry('sales', 'bank', 1000); // 1000 into bank (Dr), 1000 from sales (Cr)
        
        // Expense: Debit Expense 200
        $this->createJournalEntry('bank', 'cogs', 200); // 200 out of bank (Cr), 200 to COGS (Dr)

        $report = $this->service->profitAndLoss(now()->startOfMonth(), now()->endOfMonth());

        $this->assertEquals(1000, $report['income']['total']);
        $this->assertEquals(200, $report['expenses']['total']);
        $this->assertEquals(800, $report['net_profit']); // 1000 - 200
    }

    public function test_balance_sheet_report()
    {
        // Capital Injection: Dr Bank 5000, Cr Capital 5000
        $this->createJournalEntry('equity', 'bank', 5000);  // Changed 'capital' to 'equity' 

        // Profit: Dr Bank 1000, Cr Sales 1000
        $this->createJournalEntry('sales', 'bank', 1000);

        $report = $this->service->balanceSheet(now());

        $bankBalance = 6000; // 5000 + 1000
        $equityBalance = 5000; // Capital
        $retainedEarnings = 1000; // Sales (Income) - 0 (Expenses)

        $this->assertEquals($bankBalance, $report['assets']['total']);
        $this->assertEquals(0, $report['liabilities']['total']);
        
        $collectedEquity = collect($report['equity']['accounts']);
        $capital = $collectedEquity->firstWhere('account_code', '3000')['amount'];
        $re = $collectedEquity->firstWhere('account_name', 'Retained Earnings')['amount'];

        $this->assertEquals(5000, $capital);
        $this->assertEquals(1000, $re);
        
        $this->assertEquals($equityBalance + $retainedEarnings, $report['equity']['total']);
        $this->assertEquals($bankBalance, $report['total_liabilities_and_equity']);
    }

    public function test_trial_balance_report()
    {
        $this->createJournalEntry('sales', 'bank', 1000);
        $this->createJournalEntry('bank', 'cogs', 200);

        $report = $this->service->trialBalance(now());

        // Bank: 1000 Dr - 200 Cr = 800 Dr
        // Sales: 1000 Cr
        // COGS: 200 Dr
        
        // Total Dr: 800 (Bank) + 200 (COGS) = 1000
        // Total Cr: 1000 (Sales) = 1000
        
        $this->assertEquals(1000, $report['total_debit']);
        $this->assertEquals(1000, $report['total_credit']);
        $this->assertTrue($report['balanced']);
    }

    public function test_ar_aging_report()
    {
        $customer = Customer::factory()->create(['tenant_id' => $this->tenant->id]);
        
        // Current Invoice
        Invoice::factory()->create([
            'tenant_id' => $this->tenant->id,
            'customer_id' => $customer->id,
            'due_date' => now()->addDays(5),
            'total' => 100,
            'outstanding_amount' => 100,
            'status' => 'sent'
        ]);

        // Overdue 35 days (31-60 bucket)
        Invoice::factory()->create([
            'tenant_id' => $this->tenant->id,
            'customer_id' => $customer->id,
            'due_date' => now()->subDays(35),
            'total' => 200,
            'outstanding_amount' => 200,
            'status' => 'sent'
        ]);

        $report = $this->service->arAging();

        $this->assertEquals(100, $report['totals']['current']);
        $this->assertEquals(200, $report['totals']['31_60']);
        $this->assertEquals(300, $report['grand_total']);
    }

    public function test_ap_aging_report()
    {
        $supplier = Supplier::factory()->create(['tenant_id' => $this->tenant->id]);
        
        // Overdue 10 days (1-30 bucket)
        PurchaseInvoice::factory()->create([
            'tenant_id' => $this->tenant->id,
            'supplier_id' => $supplier->id,
            'due_date' => now()->subDays(10),
            'total' => 500,
            'outstanding_amount' => 500,
            'status' => 'posted'
        ]);

        $report = $this->service->apAging();

        $this->assertEquals(500, $report['totals']['1_30']);
        $this->assertEquals(500, $report['grand_total']);
    }

    /**
     * Helper to create a balanced entry.
     * $creditAccountKey: alias for the account to be Credited
     * $debitAccountKey: alias for the account to be Debited
     * $amount: amount
     * 
     * E.g. Sales (Cr), Bank (Dr) for a sale.
     * createJournalEntry('sales', 'bank', 100)
     */
    private function createJournalEntry($creditAccountKey, $debitAccountKey, $amount)
    {
        $entry = JournalEntry::factory()->create([
            'tenant_id' => $this->tenant->id,
            'date' => now(),
            'status' => 'posted'
        ]);

        // Cr Alias -> create Credit line
        // Wait, helper logic in head: "Sales" is usually Credit, "Bank" is Debit for sales.
        // My helper signature: createJournalEntry('sales', 'bank', 1000)
        // If I pass 'sales' (Income) as first arg, and 'bank' (Asset) as second arg
        // Logic: 
        //  - First arg = Credit this account
        //  - Second arg = Debit this account

        $creditCoa = $this->coas[$creditAccountKey] ?? $this->coas['sales']; // fallback logic if key not strict, but key implied
        $debitCoa = $this->coas[$debitAccountKey] ?? $this->coas['bank'];

        // Credit Line
        JournalLine::create([
            'journal_entry_id' => $entry->id,
            'account_id' => $this->coas[$creditAccountKey]->id,
            'type' => 'credit',
            'amount' => $amount,
        ]);

        // Debit Line
        JournalLine::create([
            'journal_entry_id' => $entry->id,
            'account_id' => $this->coas[$debitAccountKey]->id,
            'type' => 'debit',
            'amount' => $amount,
        ]);
        
        // For 'capital' test case: createJournalEntry('capital', 'bank', 5000)
        // Capital is Equity (Credit normal balance). So Crediting Capital (increasing it).
        // Bank is Asset (Debit normal balance). So Debiting Bank (increasing it).
        // Correct.
    }
}
