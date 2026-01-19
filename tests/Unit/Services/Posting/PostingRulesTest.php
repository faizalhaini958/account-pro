<?php

namespace Tests\Unit\Services\Posting;

use Tests\TestCase;
use App\Models\Invoice;
use App\Models\PurchaseInvoice;
use App\Models\Receipt;
use App\Models\SupplierPayment;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\BankAccount;
use App\Services\Posting\GLAccountResolver;
use App\Services\Posting\Rules\SalesInvoicePostingRule;
use App\Services\Posting\Rules\PurchaseInvoicePostingRule;
use App\Services\Posting\Rules\ReceiptPostingRule;
use App\Services\Posting\Rules\PaymentPostingRule;
use Mockery;

class PostingRulesTest extends TestCase
{
    private $glResolver;

    protected function setUp(): void
    {
        parent::setUp();
        $this->glResolver = Mockery::mock(GLAccountResolver::class);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_sales_invoice_rule_generates_correct_lines()
    {
        $invoice = Mockery::mock(Invoice::class);
        $customer = Mockery::mock(Customer::class);
        $customer->shouldReceive('getAttribute')->with('name')->andReturn('Test Customer');
        
        $invoice->shouldReceive('getAttribute')->with('invoice_number')->andReturn('INV-001');
        $invoice->shouldReceive('getAttribute')->with('total_amount')->andReturn(106.00);
        $invoice->shouldReceive('getAttribute')->with('subtotal')->andReturn(100.00);
        $invoice->shouldReceive('getAttribute')->with('tax_amount')->andReturn(6.00);
        $invoice->shouldReceive('getAttribute')->with('customer')->andReturn($customer);
        // $invoice->customer = $customer; // Removed causing setAttribute error 

        // Mock GL Resolver expectations
        $this->glResolver->shouldReceive('getAccountId')->with('ar_account', '1200')->andReturn(1);
        $this->glResolver->shouldReceive('getAccountId')->with('sales_account', '4001')->andReturn(2);
        $this->glResolver->shouldReceive('getAccountId')->with('tax_payable', '2102')->andReturn(3);

        $rule = new SalesInvoicePostingRule($this->glResolver);
        $lines = $rule->getJournalLines($invoice);

        $this->assertCount(3, $lines);

        // Check AR Debit
        $arLine = collect($lines)->firstWhere('account_id', 1);
        $this->assertEquals(106.00, $arLine['debit']);
        $this->assertEquals(0, $arLine['credit']);

        // Check Sales Credit
        $salesLine = collect($lines)->firstWhere('account_id', 2);
        $this->assertEquals(0, $salesLine['debit']);
        $this->assertEquals(100.00, $salesLine['credit']);

        // Check Tax Credit
        $taxLine = collect($lines)->firstWhere('account_id', 3);
        $this->assertEquals(0, $taxLine['debit']);
        $this->assertEquals(6.00, $taxLine['credit']);
    }

    public function test_purchase_invoice_rule_generates_correct_lines()
    {
        $invoice = Mockery::mock(PurchaseInvoice::class);
        $supplier = Mockery::mock(Supplier::class);
        $supplier->shouldReceive('getAttribute')->with('name')->andReturn('Test Supplier');
        
        $invoice->shouldReceive('getAttribute')->with('invoice_number')->andReturn('PINV-001');
        $invoice->shouldReceive('getAttribute')->with('total_amount')->andReturn(106.00);
        $invoice->shouldReceive('getAttribute')->with('subtotal')->andReturn(100.00);
        $invoice->shouldReceive('getAttribute')->with('tax_amount')->andReturn(6.00);
        $invoice->shouldReceive('getAttribute')->with('supplier')->andReturn($supplier);
        // $invoice->supplier = $supplier; // Removed

        $this->glResolver->shouldReceive('getAccountId')->with('inventory', '1400')->andReturn(10);
        $this->glResolver->shouldReceive('getAccountId')->with('tax_input', '1302')->andReturn(11);
        $this->glResolver->shouldReceive('getAccountId')->with('ap_account', '2100')->andReturn(12);

        $rule = new PurchaseInvoicePostingRule($this->glResolver);
        $lines = $rule->getJournalLines($invoice);

        $this->assertCount(3, $lines);

        // Check Inventory Debit
        $invLine = collect($lines)->firstWhere('account_id', 10);
        $this->assertEquals(100.00, $invLine['debit']);

        // Check Tax Debit
        $taxLine = collect($lines)->firstWhere('account_id', 11);
        $this->assertEquals(6.00, $taxLine['debit']);

        // Check AP Credit
        $apLine = collect($lines)->firstWhere('account_id', 12);
        $this->assertEquals(106.00, $apLine['credit']);
    }

    public function test_receipt_rule_generates_correct_lines()
    {
        $receipt = Mockery::mock(Receipt::class);
        $customer = Mockery::mock(Customer::class);
        $customer->shouldReceive('getAttribute')->with('name')->andReturn('Test Customer');
        
        $bankAccount = Mockery::mock(BankAccount::class);
        $bankAccount->shouldReceive('getAttribute')->with('chart_of_account_id')->andReturn(99);
        // $bankAccount->chart_of_account_id = 99; // Removed

        $receipt->shouldReceive('getAttribute')->with('reference_number')->andReturn('REC-001');
        $receipt->shouldReceive('getAttribute')->with('amount')->andReturn(500.00);
        $receipt->shouldReceive('getAttribute')->with('customer')->andReturn($customer);
        $receipt->shouldReceive('getAttribute')->with('bankAccount')->andReturn($bankAccount);
        // $receipt->customer = $customer;
        // $receipt->bankAccount = $bankAccount;

        $this->glResolver->shouldReceive('getAccountId')->with('ar_account', '1200')->andReturn(1);

        $rule = new ReceiptPostingRule($this->glResolver);
        $lines = $rule->getJournalLines($receipt);

        $this->assertCount(2, $lines);

        // Check Debit Bank
        $bankLine = collect($lines)->firstWhere('account_id', 99);
        $this->assertEquals(500.00, $bankLine['debit']);
        
        // Check Credit AR
        $arLine = collect($lines)->firstWhere('account_id', 1);
        $this->assertEquals(500.00, $arLine['credit']);
    }

    public function test_payment_rule_generates_correct_lines()
    {
        $payment = Mockery::mock(SupplierPayment::class);
        $supplier = Mockery::mock(Supplier::class);
        $supplier->shouldReceive('getAttribute')->with('name')->andReturn('Test Supplier');
        
        $bankAccount = Mockery::mock(BankAccount::class);
        $bankAccount->shouldReceive('getAttribute')->with('chart_of_account_id')->andReturn(99);
        // $bankAccount->chart_of_account_id = 99; // Removed

        $payment->shouldReceive('getAttribute')->with('reference_number')->andReturn('PAY-001');
        $payment->shouldReceive('getAttribute')->with('amount')->andReturn(300.00);
        $payment->shouldReceive('getAttribute')->with('supplier')->andReturn($supplier);
        $payment->shouldReceive('getAttribute')->with('bankAccount')->andReturn($bankAccount);
        // $payment->supplier = $supplier;
        // $payment->bankAccount = $bankAccount;

        $this->glResolver->shouldReceive('getAccountId')->with('ap_account', '2100')->andReturn(12);

        $rule = new PaymentPostingRule($this->glResolver);
        $lines = $rule->getJournalLines($payment);

        $this->assertCount(2, $lines);

        // Check Debit AP
        $apLine = collect($lines)->firstWhere('account_id', 12);
        $this->assertEquals(300.00, $apLine['debit']);
        
        // Check Credit Bank
        $bankLine = collect($lines)->firstWhere('account_id', 99);
        $this->assertEquals(300.00, $bankLine['credit']);
    }
}
