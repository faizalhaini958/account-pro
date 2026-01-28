<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tenant;
use App\Models\PaymentTransaction;
use App\Models\UserSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    /**
     * Display admin dashboard
     */
    public function index()
    {
        // User statistics
        $userStats = [
            'total' => User::count(),
            'active' => User::where('status', 'active')->count(),
            'inactive' => User::where('status', 'inactive')->count(),
            'banned' => User::where('status', 'banned')->count(),
            'pending' => User::where('status', 'pending')->count(),
            'new_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
        ];

        // Tenant statistics
        $tenantStats = [
            'total' => Tenant::count(),
            'active' => Tenant::where('is_active', true)->count(),
            'inactive' => Tenant::where('is_active', false)->count(),
        ];

        // Subscription statistics
        $subscriptionStats = [
            'active' => UserSubscription::where('status', 'active')->count(),
            'cancelled' => UserSubscription::where('status', 'cancelled')->count(),
            'expired' => UserSubscription::where('status', 'expired')->count(),
        ];

        // Revenue this month
        $revenueThisMonth = PaymentTransaction::where('status', 'completed')
            ->where('paid_at', '>=', now()->startOfMonth())
            ->sum('amount');

        // Recent registrations
        $recentUsers = User::orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'email', 'status', 'created_at']);

        // Recent transactions
        $recentTransactions = PaymentTransaction::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'userStats' => $userStats,
            'tenantStats' => $tenantStats,
            'subscriptionStats' => $subscriptionStats,
            'revenueThisMonth' => $revenueThisMonth,
            'recentUsers' => $recentUsers,
            'recentTransactions' => $recentTransactions->map(fn ($t) => [
                'id' => $t->id,
                'user' => $t->user ? $t->user->name : 'Unknown',
                'amount' => $t->amount,
                'currency' => $t->currency,
                'status' => $t->status,
                'created_at' => $t->created_at,
            ]),
        ]);
    }
}
