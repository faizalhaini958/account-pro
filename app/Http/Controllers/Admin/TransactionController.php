<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['user:id,name,email', 'plan:id,name']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('transaction_id', 'like', "%{$request->search}%")
                  ->orWhereHas('user', function ($uq) use ($request) {
                      $uq->where('name', 'like', "%{$request->search}%")
                         ->orWhere('email', 'like', "%{$request->search}%");
                  });
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->gateway) {
            $query->where('gateway', $request->gateway);
        }

        $transactions = $query->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($txn) => [
                'id' => $txn->id,
                'transaction_id' => $txn->transaction_id,
                'user' => $txn->user,
                'plan' => $txn->plan,
                'amount' => number_format($txn->amount, 2),
                'currency' => $txn->currency,
                'status' => $txn->status,
                'gateway' => $txn->gateway,
                'created_at' => $txn->created_at->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'status', 'gateway']),
        ]);
    }
}
