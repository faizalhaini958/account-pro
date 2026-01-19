import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    Users,
    Building2,
    CreditCard,
    DollarSign,
    TrendingUp,
    UserCheck,
    UserX,
    Ban,
} from 'lucide-react';

interface UserStats {
    total: number;
    active: number;
    inactive: number;
    banned: number;
    pending: number;
    new_this_month: number;
}

interface TenantStats {
    total: number;
    active: number;
    inactive: number;
}

interface SubscriptionStats {
    active: number;
    cancelled: number;
    expired: number;
}

interface RecentUser {
    id: number;
    name: string;
    email: string;
    status: string;
    created_at: string;
}

interface RecentTransaction {
    id: number;
    user: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
}

interface AdminDashboardProps {
    userStats: UserStats;
    tenantStats: TenantStats;
    subscriptionStats: SubscriptionStats;
    revenueThisMonth: number;
    recentUsers: RecentUser[];
    recentTransactions: RecentTransaction[];
}

export default function AdminDashboard({
    userStats,
    tenantStats,
    subscriptionStats,
    revenueThisMonth,
    recentUsers,
    recentTransactions,
}: AdminDashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            inactive: 'secondary',
            banned: 'destructive',
            pending: 'outline',
            completed: 'default',
            failed: 'destructive',
        };
        return variants[status] || 'outline';
    };

    return (
        <AdminLayout header="Dashboard">
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                    <p className="text-muted-foreground">
                        System overview and management
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userStats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                +{userStats.new_this_month} new this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userStats.active}</div>
                            <p className="text-xs text-muted-foreground">
                                {userStats.inactive} inactive, {userStats.banned} banned
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Companies</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{tenantStats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {tenantStats.active} active, {tenantStats.inactive} inactive
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(revenueThisMonth)}</div>
                            <p className="text-xs text-muted-foreground">
                                {subscriptionStats.active} active subscriptions
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Recent Users */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Registrations</CardTitle>
                            <CardDescription>Latest users who signed up</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentUsers.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No recent registrations</p>
                                ) : (
                                    recentUsers.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={getStatusBadge(user.status)}>
                                                    {user.status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(user.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Latest payment activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentTransactions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No recent transactions</p>
                                ) : (
                                    recentTransactions.map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{transaction.user}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(transaction.amount)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={getStatusBadge(transaction.status)}>
                                                    {transaction.status}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(transaction.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Subscription Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Overview</CardTitle>
                        <CardDescription>Current subscription status breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex items-center gap-4 rounded-lg border p-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{subscriptionStats.active}</p>
                                    <p className="text-sm text-muted-foreground">Active</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 rounded-lg border p-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                                    <UserX className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{subscriptionStats.cancelled}</p>
                                    <p className="text-sm text-muted-foreground">Cancelled</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 rounded-lg border p-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                                    <Ban className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{subscriptionStats.expired}</p>
                                    <p className="text-sm text-muted-foreground">Expired</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
