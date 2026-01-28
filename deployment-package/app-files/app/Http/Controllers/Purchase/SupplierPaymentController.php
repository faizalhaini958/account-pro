<?php

namespace App\Http\Controllers\Purchase;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\PurchaseInvoice;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\NumberingService;
use Illuminate\Support\Facades\DB;

class SupplierPaymentController extends Controller
{
    protected $numberingService;

    public function __construct(NumberingService $numberingService)
    {
        $this->numberingService = $numberingService;
    }
    public function index()
    {
        $this->authorize('purchases.view');

        $payments = SupplierPayment::with(['supplier', 'bankAccount'])
            ->orderByDesc('date')
            ->paginate(10);

        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();
        $bankAccounts = BankAccount::where('is_active', true)->orderBy('bank_name')->get();

        return Inertia::render('Purchase/Payments/Index', [
            'payments' => $payments,
            'suppliers' => $suppliers,
            'bankAccounts' => $bankAccounts,
        ]);
    }

    public function create()
    {
        $this->authorize('purchases.create');

        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();
        $bankAccounts = BankAccount::where('is_active', true)->orderBy('bank_name')->get();

        return Inertia::render('Purchase/Payments/Create', [
            'suppliers' => $suppliers,
            'bankAccounts' => $bankAccounts,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('purchases.create');

        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'date' => 'required|date',
            'reference_number' => 'required|string|max:50',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string',
            'payment_method' => 'required|string',
            'allocations' => 'nullable|array',
            'allocations.*.invoice_id' => 'required|exists:purchase_invoices,id',
            'allocations.*.amount' => 'required|numeric|min:0.01',
        ]);

        DB::transaction(function () use ($validated) {
            // Create Payment
            $payment = SupplierPayment::create([
                // 'tenant_id' => 1,
                'number' => $this->numberingService->generate('payment', 'PV-'),
                'supplier_id' => $validated['supplier_id'],
                'bank_account_id' => $validated['bank_account_id'],
                'date' => $validated['date'],
                'reference_number' => $validated['reference_number'],
                'amount' => $validated['amount'],
                'notes' => $validated['notes'],
                'payment_method' => $validated['payment_method'],
            ]);

            // Process Allocations
            if (!empty($validated['allocations'])) {
                foreach ($validated['allocations'] as $allocation) {
                    $invoice = PurchaseInvoice::find($allocation['invoice_id']);

                    if ($invoice && $invoice->outstanding_amount > 0) {
                        $allocatedAmount = min($allocation['amount'], $invoice->outstanding_amount);

                        $payment->allocations()->create([
                            'purchase_invoice_id' => $invoice->id,
                            'amount' => $allocatedAmount,
                        ]);

                        $invoice->paid_amount += $allocatedAmount;
                        $invoice->outstanding_amount -= $allocatedAmount;

                        if ($invoice->outstanding_amount <= 0) {
                            $invoice->status = 'paid';
                        }

                        $invoice->save();
                    }
                }
            }

            // TODO: Create GL entries for Payment (Cr Bank, Dr Accounts Payable)
        });

        return redirect()->route('purchase.payments.index')
            ->with('success', 'Payment recorded successfully.');
    }

    public function show(SupplierPayment $supplierPayment)
    {
        $this->authorize('purchases.view');

         $supplierPayment->load(['allocations.purchaseInvoice', 'supplier', 'bankAccount']);

         return Inertia::render('Purchase/Payments/Show', [
             'payment' => $supplierPayment
         ]);
    }

    public function destroy(SupplierPayment $supplierPayment)
    {
        $this->authorize('purchases.delete');

        DB::transaction(function() use ($supplierPayment) {
            // Reverse allocations
            foreach($supplierPayment->allocations as $allocation) {
                $invoice = $allocation->purchaseInvoice;
                if($invoice) {
                    $invoice->paid_amount -= $allocation->amount;
                    $invoice->outstanding_amount += $allocation->amount;
                    if($invoice->status === 'paid' && $invoice->outstanding_amount > 0) {
                        $invoice->status = 'posted'; // Revert to posted
                    }
                     $invoice->save();
                }
            }
            $supplierPayment->delete();
        });

        return redirect()->route('purchase.payments.index')
             ->with('success', 'Payment deleted and allocations reversed.');
    }

    public function pdf(SupplierPayment $supplierPayment)
    {
        $this->authorize('purchases.view');

        $supplierPayment->load(['allocations.purchaseInvoice', 'supplier', 'bankAccount', 'tenant']);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.payment-voucher', [
            'payment' => $supplierPayment,
            'tenant' => $supplierPayment->tenant,
        ]);

        return $pdf->download('payment-voucher-' . $supplierPayment->voucher_number . '.pdf');
    }
}
