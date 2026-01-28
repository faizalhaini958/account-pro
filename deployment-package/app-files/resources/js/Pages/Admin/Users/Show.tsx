import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    ArrowLeft,
    User,
    Shield,
    Building2,
    CreditCard,
    Calendar,
    Globe,
    Mail,
    Clock,
    Ban,
    CheckCircle2,
    Pencil,
    UserCog,
    AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';

interface TenantInfo {
    id: number;
    name: string;
    is_active: boolean;
}

interface SubscriptionInfo {
    id: number;
    plan: string;
    status: string;
    billing_cycle: string;
    starts_at: string;
    ends_at?: string;
    cancelled_at?: string;
}

interface TransactionInfo {
    id: number;
    amount: number;
    currency: string;
    status: string;
    type: string;
    gateway_code: string;
    paid_at?: string;
    created_at: string;
}

interface SubscriptionPlan {
    id: number;
    code: string;
    name: string;
    price_monthly: number;
    price_yearly: number;
}

interface UserShowProps {
    user: {
        id: number;
        name: string;
        email: string;
        status: string;
        is_super_admin: boolean;
        email_verified_at?: string;
        last_login_at?: string;
        last_login_ip?: string;
        banned_at?: string;
        ban_reason?: string;
        admin_notes?: string;
        created_at: string;
        updated_at: string;
        tenants: TenantInfo[];
        subscriptions: SubscriptionInfo[];
        recent_transactions: TransactionInfo[];
    };
    plans: SubscriptionPlan[];
}

export default function UserShow({ user, plans }: UserShowProps) {
    const [banDialog, setBanDialog] = useState(false);
    const [banReason, setBanReason] = useState('');
    const [subscriptionDialog, setSubscriptionDialog] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [billingCycle, setBillingCycle] = useState('monthly');

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR',
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            active: 'default',
            inactive: 'secondary',
            banned: 'destructive',
            pending: 'outline',
            completed: 'default',
            failed: 'destructive',
            cancelled: 'secondary',
        };
        return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
    };

    const handleBan = () => {
        router.post(route('admin.users.ban', user.id), {
            reason: banReason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setBanDialog(false);
                setBanReason('');
            },
        });
    };

    const handleUnban = () => {
        router.post(route('admin.users.unban', user.id), {}, {
            preserveScroll: true,
        });
    };

    const handleToggle = () => {
        router.post(route('admin.users.toggle', user.id), {}, {
            preserveScroll: true,
        });
    };

    const handleAssignSubscription = () => {
        router.post(route('admin.users.subscription.assign', user.id), {
            plan_id: selectedPlan,
            billing_cycle: billingCycle,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSubscriptionDialog(false);
                setSelectedPlan('');
            },
        });
    };

    const handleCancelSubscription = () => {
        if (confirm('Are you sure you want to cancel this subscription?')) {
            router.delete(route('admin.users.subscription.cancel', user.id), {
                preserveScroll: true,
            });
        }
    };

    const handleImpersonate = () => {
        if (confirm(`Are you sure you want to login as ${user.name}?`)) {
            router.post(route('admin.users.impersonate', user.id));
        }
    };

    const activeSubscription = user.subscriptions.find(s => s.status === 'active');

    return (
        <AdminLayout header="User Details">
            <Head title={`User: ${user.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('admin.users.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                {user.name}
                                {user.is_super_admin && (
                                    <Badge variant="secondary">
                                        <Shield className="mr-1 h-3 w-3" />
                                        Super Admin
                                    </Badge>
                                )}
                            </h2>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {!user.is_super_admin && (
                            <Button variant="outline" onClick={handleImpersonate}>
                                <UserCog className="mr-2 h-4 w-4" />
                                Login as User
                            </Button>
                        )}
                        <Button asChild>
                            <Link href={route('admin.users.edit', user.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* User Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    User Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                                        <dd className="mt-1">{getStatusBadge(user.status)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Email Verified</dt>
                                        <dd className="mt-1">
                                            {user.email_verified_at ? (
                                                <Badge variant="default">
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                    Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">Not Verified</Badge>
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Last Login
                                        </dt>
                                        <dd className="mt-1 text-sm">{formatDate(user.last_login_at)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                            <Globe className="h-3 w-3" />
                                            Last IP
                                        </dt>
                                        <dd className="mt-1 text-sm font-mono">{user.last_login_ip || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Joined
                                        </dt>
                                        <dd className="mt-1 text-sm">{formatDate(user.created_at)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Updated
                                        </dt>
                                        <dd className="mt-1 text-sm">{formatDate(user.updated_at)}</dd>
                                    </div>
                                </dl>

                                {user.banned_at && (
                                    <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                                        <div className="flex items-center gap-2 text-destructive font-medium">
                                            <Ban className="h-4 w-4" />
                                            User is Banned
                                        </div>
                                        <p className="text-sm mt-1">
                                            <strong>Reason:</strong> {user.ban_reason}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Banned on {formatDate(user.banned_at)}
                                        </p>
                                    </div>
                                )}

                                {user.admin_notes && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Admin Notes</h4>
                                        <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                                            {user.admin_notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Companies */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Companies ({user.tenants.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {user.tenants.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">No companies created</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Company Name</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {user.tenants.map((tenant) => (
                                                <TableRow key={tenant.id}>
                                                    <TableCell className="font-medium">{tenant.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                                                            {tenant.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Transactions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {user.recent_transactions.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">No transactions found</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Gateway</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {user.recent_transactions.map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell className="text-sm">
                                                        {formatDate(transaction.created_at)}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {formatCurrency(transaction.amount)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{transaction.type}</Badge>
                                                    </TableCell>
                                                    <TableCell>{transaction.gateway_code}</TableCell>
                                                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Subscription */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Subscription
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {activeSubscription ? (
                                    <>
                                        <div className="p-4 bg-muted rounded-lg">
                                            <div className="font-medium text-lg">{activeSubscription.plan}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {activeSubscription.billing_cycle} billing
                                            </div>
                                            <div className="mt-2">
                                                {getStatusBadge(activeSubscription.status)}
                                            </div>
                                        </div>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Started</dt>
                                                <dd>{formatDate(activeSubscription.starts_at)}</dd>
                                            </div>
                                            {activeSubscription.ends_at && (
                                                <div className="flex justify-between">
                                                    <dt className="text-muted-foreground">Expires</dt>
                                                    <dd>{formatDate(activeSubscription.ends_at)}</dd>
                                                </div>
                                            )}
                                        </dl>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={handleCancelSubscription}
                                        >
                                            Cancel Subscription
                                        </Button>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                        <p className="text-muted-foreground text-sm mb-4">No active subscription</p>
                                        <Button onClick={() => setSubscriptionDialog(true)} className="w-full">
                                            Assign Subscription
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => setSubscriptionDialog(true)}
                                >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    {activeSubscription ? 'Change Plan' : 'Assign Plan'}
                                </Button>

                                {!user.is_super_admin && (
                                    <>
                                        {user.status === 'active' ? (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={handleToggle}
                                            >
                                                <AlertTriangle className="mr-2 h-4 w-4" />
                                                Disable User
                                            </Button>
                                        ) : user.status === 'inactive' ? (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={handleToggle}
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Enable User
                                            </Button>
                                        ) : null}

                                        {user.status === 'banned' ? (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={handleUnban}
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Unban User
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="destructive"
                                                className="w-full justify-start"
                                                onClick={() => setBanDialog(true)}
                                            >
                                                <Ban className="mr-2 h-4 w-4" />
                                                Ban User
                                            </Button>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Subscription History */}
                        {user.subscriptions.length > 1 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Subscription History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {user.subscriptions.map((sub) => (
                                            <div key={sub.id} className="flex justify-between items-center text-sm">
                                                <div>
                                                    <div className="font-medium">{sub.plan}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatDate(sub.starts_at)}
                                                    </div>
                                                </div>
                                                {getStatusBadge(sub.status)}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Ban Dialog */}
            <Dialog open={banDialog} onOpenChange={setBanDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ban User</DialogTitle>
                        <DialogDescription>
                            This will prevent {user.name} from accessing the system.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ban_reason">Reason for ban</Label>
                            <Textarea
                                id="ban_reason"
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                placeholder="Enter the reason for banning this user..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBanDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleBan} disabled={!banReason}>
                            Ban User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Subscription Dialog */}
            <Dialog open={subscriptionDialog} onOpenChange={setSubscriptionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Subscription</DialogTitle>
                        <DialogDescription>
                            Select a plan to assign to {user.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Subscription Plan</Label>
                            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {plans.map((plan) => (
                                        <SelectItem key={plan.id} value={plan.id.toString()}>
                                            {plan.name} - RM{plan.price_monthly}/mo
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Billing Cycle</Label>
                            <Select value={billingCycle} onValueChange={setBillingCycle}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSubscriptionDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssignSubscription} disabled={!selectedPlan}>
                            Assign Subscription
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
