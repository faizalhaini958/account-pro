<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Receipt;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\ReceiptAllocation;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Services\PostingService;
use App\Services\Posting\Rules\ReceiptPostingRule;
use App\Services\Posting\GLAccountResolver;

class ReceiptController extends Controller
{
    protected PostingService $postingService;
    protected GLAccountResolver $glResolver;

    public function __construct(PostingService $postingService, GLAccountResolver $glResolver)
    {
        $this->postingService = $postingService;
        $this->glResolver = $glResolver;
    }
    public function index()
    {
        $this->authorize('sales.view');

        $receipts = Receipt::with(['customer', 'bankAccount'])
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10);

        $customers = Customer::where('is_active', true)->orderBy('name')->get();
        $bankAccounts = BankAccount::where('is_active', true)->orderBy('bank_name')->get();

        return Inertia::render('Sales/Receipts/Index', [
            'receipts' => $receipts,
            'customers' => $customers,
            'bankAccounts' => $bankAccounts,
        ]);
    }

    public function create()
    {
        $this->authorize('sales.create');

        return Inertia::render('Sales/Receipts/Create', [
            'customers' => Customer::where('is_active', true)->orderBy('name')->get(),
            'bankAccounts' => BankAccount::where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('sales.create');

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'date' => 'required|date',
            'reference_number' => 'nullable|string|max:50',
            'payment_method' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string',
            'allocations' => 'array',
            'allocations.*.invoice_id' => 'required|exists:invoices,id',
            'allocations.*.amount' => 'required|numeric|min:0.01',
        ]);

        DB::transaction(function () use ($validated) {
            $receipt = Receipt::create([
                // 'tenant_id' => 1,
                'customer_id' => $validated['customer_id'],
                'bank_account_id' => $validated['bank_account_id'],
                'date' => $validated['date'],
                'number' => 'REC-' . date('Ymd') . '-' . str_pad((Receipt::withTrashed()->count() + 1), 4, '0', STR_PAD_LEFT),
                'reference_number' => $validated['reference_number'] ?? null,
                'payment_method' => strtolower(str_replace(' ', '_', $validated['payment_method'])),
                'amount' => $validated['amount'],
                'notes' => $validated['notes'],
            ]);

            // Handle Allocations
            if (!empty($validated['allocations'])) {
                foreach ($validated['allocations'] as $allocation) {
                    $amount = $allocation['amount'];
                    $invoice = Invoice::lockForUpdate()->find($allocation['invoice_id']);

                    if ($invoice) {
                        ReceiptAllocation::create([
                            'receipt_id' => $receipt->id,
                            'invoice_id' => $invoice->id,
                            'amount' => $amount,
                        ]);

                        // Update Invoice Status
                        $newPaidAmount = $invoice->paid_amount + $amount;
                        $newOutstanding = $invoice->total - $newPaidAmount;

                        $status = 'partial';
                        if ($newOutstanding <= 0) {
                            $status = 'paid';
                            $newOutstanding = 0; // Prevent negative checks
                        }

                        $invoice->update([
                            'paid_amount' => $newPaidAmount,
                            'outstanding_amount' => $newOutstanding,
                            'status' => $status,
                        ]);
                    }
                }
            }

            // GL Posting using PostingService
            $rule = new ReceiptPostingRule($this->glResolver);
            $this->postingService->post($receipt, $rule);
        });

        return redirect()->route('sales.receipts.index')
            ->with('success', 'Receipt recorded successfully.');
    }

    public function show(Receipt $receipt)
    {
        $this->authorize('sales.view');

        return Inertia::render('Sales/Receipts/Show', [
            'receipt' => $receipt->load(['customer', 'bankAccount', 'allocations.invoice']),
        ]);
    }

    public function pdf(Receipt $receipt)
    {
        $this->authorize('sales.view');

        $receipt->load(['customer', 'tenant', 'allocations.invoice']);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.receipt', [
            'receipt' => $receipt,
            'tenant' => $receipt->tenant,
        ]);

        return $pdf->download('receipt-' . $receipt->number . '.pdf');
    }

    public function destroy(Receipt $receipt)
    {
        $this->authorize('sales.delete');

        DB::transaction(function () use ($receipt) {
            // Reverse allocations
            foreach ($receipt->allocations as $allocation) {
                $invoice = Invoice::lockForUpdate()->find($allocation->invoice_id);
                if ($invoice) {
                    $newPaidAmount = $invoice->paid_amount - $allocation->amount;
                    $newOutstanding = $invoice->outstanding_amount + $allocation->amount;

                    $status = 'partial';
                    if ($newPaidAmount <= 0) {
                        $status = 'posted'; // Revert to posted if no payments left
                        $newPaidAmount = 0;
                    } elseif ($newOutstanding <= 0) {
                         $status = 'paid'; // Should not happen in reverse but for safety
                    }

                    $invoice->update([
                        'paid_amount' => $newPaidAmount,
                        'outstanding_amount' => $newOutstanding,
                        'status' => $status,
                    ]);
                }
            }

            $receipt->delete();

            // Reverse GL Posting using PostingService
            $journalEntry = \App\Models\JournalEntry::where('source_type', Receipt::class)
                ->where('source_id', $receipt->id)
                ->where('posted', true)
                ->first();

            if ($journalEntry) {
                $this->postingService->reverse($journalEntry, 'Delete Receipt #' . $receipt->reference_number);
            }
        });

        return redirect()->route('sales.receipts.index')
            ->with('success', 'Receipt deleted successfully.');
    }

    public function getOutstandingInvoices(Customer $customer)
    {
        $invoices = Invoice::where('customer_id', $customer->id)
            ->whereIn('status', ['posted', 'partial', 'overdue'])
            ->where('outstanding_amount', '>', 0)
            ->orderBy('due_date')
            ->get();

        return response()->json($invoices);
    }

    private function createGlEntry(Receipt $receipt, bool $reverse = false)
    {
        // Get Accounts
        $bankAccount = BankAccount::find($receipt->bank_account_id);
        $bankGlAccountId = $bankAccount ? $bankAccount->account_id : null;
        $arAccount = \App\Models\ChartOfAccount::where('code', '1200')->first(); // Accounts Receivable

        if (!$bankGlAccountId || !$arAccount) {
            // Log error or ignore if setup incomplete
            return;
        }

        $entry = \App\Models\JournalEntry::create([
            'tenant_id' => $receipt->tenant_id,
            'date' => $receipt->date,
            'description' => ($reverse ? 'Reverse ' : '') . 'Receipt #' . $receipt->reference_number,
            'source_type' => \App\Models\Receipt::class,
            'source_id' => $receipt->id,
            'posted_at' => now(),
            'is_system_generated' => true,
        ]);

        $lines = [];

        // Bank (Debit normally for receipt)
        $lines[] = [
            'journal_entry_id' => $entry->id,
            'account_id' => $bankGlAccountId,
            'description' => $bankAccount->name ?? 'Bank Account',
            'debit' => $reverse ? 0 : $receipt->amount,
            'credit' => $reverse ? $receipt->amount : 0,
        ];

        // AR (Credit normally for receipt - reducing asset)
        $lines[] = [
            'journal_entry_id' => $entry->id,
            'account_id' => $arAccount->id,
            'description' => 'Accounts Receivable',
            'debit' => $reverse ? $receipt->amount : 0,
            'credit' => $reverse ? 0 : $receipt->amount,
        ];

        foreach ($lines as $line) {
            \App\Models\JournalLine::create($line);
        }
    }
}
