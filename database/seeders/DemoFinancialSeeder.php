<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\Invoice;
use App\Models\PurchaseInvoice;
use App\Models\BankAccount;
use App\Models\Receipt;
use App\Models\SupplierPayment;
use App\Services\NumberingService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DemoFinancialSeeder extends Seeder
{
    public function run()
    {
        $email = 'contact.digit360@gmail.com';
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->command->error("User not found: {$email}");
            return;
        }

        // Assuming user has a currentTenant or associated tenant
        $tenant = $user->tenants()->first(); // Adjust if necessary based on relationship

        if (!$tenant) {
            $this->command->error("No tenant found for user: {$email}");
            return;
        }

        $this->command->info("Seeding data for Tenant: {$tenant->name} (ID: {$tenant->id})");

        // Set Tenant Context explicitly if strictly scoped, or just use relationships
        // For simplicity in seeder, we'll manually set tenant_id if models aren't auto-scoped in CLI
        // But usually, we might need to be careful. Let's assume we can just create related models.
        
        // Ensure NumberingService is available
        $numberingService = app(NumberingService::class);

        // Set Tenant Context to ensure global scopes work correctly
        \App\Services\TenantContext::setTenant($tenant);

        // Set Tenant Context to ensure global scopes work correctly
        \App\Services\TenantContext::setTenant($tenant);

        // Set Tenant Context to ensure global scopes work correctly
        \App\Services\TenantContext::setTenant($tenant);

        DB::transaction(function () use ($tenant, $numberingService) {
            // 0. Ensure a Chart of Account for Bank exists
            $bankCoA = \App\Models\ChartOfAccount::firstOrCreate(
                [
                    'tenant_id' => $tenant->id,
                    'code' => '1000-BANK',
                ],
                [
                    'name' => 'Bank - General',
                    'type' => 'asset',
                    'is_active' => true,
                ]
            );

            // 1. Bank Account
            // Use specific account number or random if just seeding generic
            $accountNumber = '1' . str_pad((string)rand(0, 999999999), 9, '0', STR_PAD_LEFT);
            
            // Allow existing bank account if matches some criteria, or create new
            $bank = BankAccount::where('tenant_id', $tenant->id)->first();
            
            if (!$bank) {
                $bank = BankAccount::create([
                    'tenant_id' => $tenant->id,
                    'name' => $tenant->name . ' Main Account', // Changed from account_name to name
                    'bank_name' => 'Maybank',
                    'account_number' => $accountNumber,
                    'account_type' => 'Current',
                    'account_id' => $bankCoA->id, // Required FK
                    'is_active' => true,
                    'opening_balance' => 50000,
                    // 'current_balance' => 50000, // Not in migration, logic likely calc or dynamic
                ]);
            }

            // 2. Customers
            $customers = Customer::factory()->count(5)->create(['tenant_id' => $tenant->id]);

            // 3. Suppliers
            $suppliers = Supplier::factory()->count(5)->create(['tenant_id' => $tenant->id]);

            // 4. Products
            $products = Product::factory()->count(10)->create(['tenant_id' => $tenant->id]);

            // 5. Sales Invoices
            foreach ($customers as $index => $customer) {
                // Create 2-4 invoices for each customer
                for ($i = 0; $i < rand(2, 4); $i++) {
                    // Force the first invoice of the first 3 customers to be TODAY so dashboard shows data
                    if ($index < 3 && $i === 0) {
                        $date = Carbon::now();
                    } else {
                        $date = Carbon::now()->subDays(rand(1, 60));
                    }
                    
                    $dueDate = $date->copy()->addDays(30);
                    
                    $invoice = Invoice::create([
                        'tenant_id' => $tenant->id,
                        'customer_id' => $customer->id,
                        'number' => $numberingService->generate('invoice', 'INV-'),
                        'date' => $date,
                        'due_date' => $dueDate,
                        'status' => 'draft', // Will update below
                        'subtotal' => 0,
                        'tax_amount' => 0,
                        'total' => 0,
                        'outstanding_amount' => 0,
                        'paid_amount' => 0,
                    ]);

                    // Add Items
                    $subtotal = 0;
                    $itemCount = rand(2, 5);
                    for ($j = 0; $j < $itemCount; $j++) {
                        $product = $products->random();
                        $qty = rand(1, 10);
                        $price = $product->retail_price;
                        $lineTotal = $qty * $price;
                        
                        $invoice->items()->create([
                            'product_id' => $product->id,
                            'description' => $product->name,
                            'quantity' => $qty,
                            'unit_price' => $price,
                            'total' => $lineTotal,
                        ]);

                        $subtotal += $lineTotal;
                    }

                    $invoice->subtotal = $subtotal;
                    $invoice->total = $subtotal; // Assuming no tax
                    $invoice->outstanding_amount = $subtotal;
                    $invoice->status = 'posted';
                    $invoice->save();

                    // Randomly Pay some invoices (but keeping today's invoices UNPAID mostly so they show as receivables)
                    // Unless it's an older invoice, then randomize payment
                    if ($date->diffInDays(now()) > 0 && rand(0, 10) > 3) { // 70% chance to pay older invoices
                        $receiptNumber = $numberingService->generate('receipt', 'REC-');
                        $receipt = Receipt::create([
                            'tenant_id' => $tenant->id,
                            'customer_id' => $customer->id,
                            'number' => $receiptNumber,
                            'date' => $date->copy()->addDays(rand(0, 5))->min(Carbon::now()),
                            'amount' => $invoice->total,
                            'payment_method' => 'bank_transfer',
                            'reference_number' => 'REF-' . rand(10000, 99999),
                        ]);

                        // Allocation
                        $receipt->allocations()->create([
                            'invoice_id' => $invoice->id,
                            'amount' => $invoice->total,
                        ]);

                        $invoice->paid_amount = $invoice->total;
                        $invoice->outstanding_amount = 0;
                        $invoice->status = 'paid';
                        $invoice->save();
                    }
                }
            }

            // 6. Purchase Invoices (Expenses)
            foreach ($suppliers as $supplier) {
                for ($i = 0; $i < rand(2, 4); $i++) {
                    $date = Carbon::now()->subDays(rand(0, 60));
                    $dueDate = $date->copy()->addDays(30);

                    $purchase = PurchaseInvoice::create([
                        'tenant_id' => $tenant->id,
                        'supplier_id' => $supplier->id,
                         // Internal System Number
                        'number' => $numberingService->generate('purchase_invoice', 'BILL-'),
                        // External Supplier Reference
                        'supplier_invoice_number' => 'SUP-' . Carbon::now()->timestamp . '-' . rand(1000, 9999),
                        'date' => $date,
                        'due_date' => $dueDate,
                        'status' => 'posted',
                        'subtotal' => 0,
                        'total' => 0,
                        'outstanding_amount' => 0,
                        'paid_amount' => 0, 
                    ]);

                     // Add Items
                     $subtotal = 0;
                     $itemCount = rand(2, 5);
                     for ($j = 0; $j < $itemCount; $j++) {
                         $qty = rand(5, 50);
                         $cost = rand(10, 200);
                         $lineTotal = $qty * $cost;
                         
                         $purchase->items()->create([
                             'description' => 'Material ' . rand(100, 999),
                             'quantity' => $qty,
                             'unit_price' => $cost,
                             'total' => $lineTotal,
                         ]);
 
                         $subtotal += $lineTotal;
                     }

                     $purchase->subtotal = $subtotal;
                     $purchase->total = $subtotal;
                     $purchase->outstanding_amount = $subtotal;
                     $purchase->save();

                     // Randomly Pay
                     if (rand(0, 10) > 4) { // 60% chance to pay
                        try {
                            $paymentNumber = $numberingService->generate('payment', 'PV-');
                            $payment = SupplierPayment::create([
                                'tenant_id' => $tenant->id,
                                'supplier_id' => $supplier->id,
                                'bank_account_id' => $bank->id,
                                'number' => $paymentNumber,
                                'date' => $date->copy()->addDays(rand(0, 5))->min(Carbon::now()),
                                'amount' => $purchase->total,
                                'payment_method' => 'bank_transfer',
                                'reference_number' => 'PAY-' . rand(10000, 99999),
                            ]);

                            $payment->allocations()->create([
                                'purchase_invoice_id' => $purchase->id,
                                'amount' => $purchase->total,
                            ]);

                            $purchase->paid_amount = $purchase->total;
                            $purchase->outstanding_amount = 0;
                            $purchase->status = 'paid';
                            $purchase->save();
                        } catch (\Exception $e) {
                            echo "Error creating payment: " . $e->getMessage() . "\n";
                        }
                     }
                }
            }

        });

        $this->command->info("Demo financial data seeded successfully for tenant {$tenant->name}.");
    }
}
