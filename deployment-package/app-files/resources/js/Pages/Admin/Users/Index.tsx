import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Users,
    Search,
    MoreHorizontal,
    Eye,
    Pencil,
    Ban,
    CheckCircle2,
    XCircle,
    UserCog,
    Shield,
    CreditCard,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface UserSubscription {
    plan: string;
    status: string;
    ends_at?: string;
}

interface UserData {
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
    tenants_count: number;
    subscription?: UserSubscription;
    created_at: string;
}

interface SubscriptionPlan {
    id: number;
    code: string;
    name: string;
    price_monthly: number;
    price_yearly: number;
}

interface PaginatedUsers {
    data: UserData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface UsersIndexProps {
    users: PaginatedUsers;
    plans: SubscriptionPlan[];
    filters: {
        search: string;
        status: string;
        subscription: string;
    };
}

export default function UsersIndex({ users, plans, filters }: UsersIndexProps) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status || 'all');
    const [subscription, setSubscription] = useState(filters.subscription || 'all');

    const [banDialog, setBanDialog] = useState<UserData | null>(null);
    const [banReason, setBanReason] = useState('');
    const [subscriptionDialog, setSubscriptionDialog] = useState<UserData | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const [billingCycle, setBillingCycle] = useState<string>('monthly');
    const [deleteDialog, setDeleteDialog] = useState<UserData | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.users.index'), {
            search,
            status: status === 'all' ? '' : status,
            subscription: subscription === 'all' ? '' : subscription,
        }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        const params: Record<string, string> = {
            search,
            status: status === 'all' ? '' : status,
            subscription: subscription === 'all' ? '' : subscription,
        };
        params[key] = value === 'all' ? '' : value;

        if (key === 'status') setStatus(value);
        if (key === 'subscription') setSubscription(value);

        router.get(route('admin.users.index'), params, { preserveState: true });
    };

    const handleBan = () => {
        if (banDialog && banReason) {
            router.post(route('admin.users.ban', banDialog.id), {
                reason: banReason,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setBanDialog(null);
                    setBanReason('');
                },
            });
        }
    };

    const handleUnban = (user: UserData) => {
        router.post(route('admin.users.unban', user.id), {}, {
            preserveScroll: true,
        });
    };

    const handleToggle = (user: UserData) => {
        router.post(route('admin.users.toggle', user.id), {}, {
            preserveScroll: true,
        });
    };

    const handleAssignSubscription = () => {
        if (subscriptionDialog && selectedPlan) {
            router.post(route('admin.users.subscription.assign', subscriptionDialog.id), {
                plan_id: selectedPlan,
                billing_cycle: billingCycle,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSubscriptionDialog(null);
                    setSelectedPlan('');
                },
            });
        }
    };

    const handleImpersonate = (user: UserData) => {
        if (confirm(`Are you sure you want to login as ${user.name}?`)) {
            router.post(route('admin.users.impersonate', user.id));
        }
    };

    const handleDelete = () => {
        if (deleteDialog) {
            router.delete(route('admin.users.destroy', deleteDialog.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteDialog(null);
                },
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
            active: { variant: 'default', label: 'Active' },
            inactive: { variant: 'secondary', label: 'Inactive' },
            banned: { variant: 'destructive', label: 'Banned' },
            pending: { variant: 'outline', label: 'Pending' },
        };
        const config = variants[status] || { variant: 'outline', label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AdminLayout header="User Management">
            <Head title="User Management" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">
                        Manage user accounts, subscriptions, and access
                    </p>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={status} onValueChange={(v) => handleFilterChange('status', v)}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="banned">Banned</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={subscription} onValueChange={(v) => handleFilterChange('subscription', v)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Subscriptions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subscriptions</SelectItem>
                                    <SelectItem value="active">Has Subscription</SelectItem>
                                    <SelectItem value="none">No Subscription</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit">Search</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Users ({users.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Subscription</TableHead>
                                    <TableHead>Companies</TableHead>
                                    <TableHead>Last Login</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                        {user.is_super_admin ? (
                                                            <Shield className="h-5 w-5 text-primary" />
                                                        ) : (
                                                            <span className="text-sm font-medium">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium flex items-center gap-2">
                                                            {user.name}
                                                            {user.is_super_admin && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Super Admin
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(user.status)}
                                                {user.banned_at && (
                                                    <p className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate">
                                                        {user.ban_reason}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {user.subscription ? (
                                                    <div>
                                                        <Badge variant="outline">{user.subscription.plan}</Badge>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {user.subscription.ends_at ? `Expires ${formatDate(user.subscription.ends_at)}` : 'Active'}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">No subscription</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{user.tenants_count}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {formatDate(user.last_login_at)}
                                                </div>
                                                {user.last_login_ip && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {user.last_login_ip}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>{formatDate(user.created_at)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('admin.users.show', user.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('admin.users.edit', user.id)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {user.subscription ? (
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('admin.subscriptions.index', { search: user.email })}>
                                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                                    View Subscription
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem onClick={() => setSubscriptionDialog(user)}>
                                                                <CreditCard className="mr-2 h-4 w-4" />
                                                                Assign Subscription
                                                            </DropdownMenuItem>
                                                        )}
                                                        {!user.is_super_admin && (
                                                            <DropdownMenuItem onClick={() => handleImpersonate(user)}>
                                                                <UserCog className="mr-2 h-4 w-4" />
                                                                Login as User
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        {user.status === 'active' && !user.is_super_admin && (
                                                            <DropdownMenuItem onClick={() => handleToggle(user)}>
                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                Disable
                                                            </DropdownMenuItem>
                                                        )}
                                                        {user.status === 'inactive' && (
                                                            <DropdownMenuItem onClick={() => handleToggle(user)}>
                                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                Enable
                                                            </DropdownMenuItem>
                                                        )}
                                                        {user.status === 'banned' ? (
                                                            <DropdownMenuItem onClick={() => handleUnban(user)}>
                                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                Unban
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            !user.is_super_admin && (
                                                                <DropdownMenuItem
                                                                    onClick={() => setBanDialog(user)}
                                                                    className="text-destructive"
                                                                >
                                                                    <Ban className="mr-2 h-4 w-4" />
                                                                    Ban User
                                                                </DropdownMenuItem>
                                                            )
                                                        )}
                                                        {!user.is_super_admin && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => setDeleteDialog(user)}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete User
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {users.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Ban Dialog */}
            <Dialog open={!!banDialog} onOpenChange={() => setBanDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ban User</DialogTitle>
                        <DialogDescription>
                            This will prevent {banDialog?.name} from accessing the system.
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
                        <Button variant="outline" onClick={() => setBanDialog(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleBan} disabled={!banReason}>
                            Ban User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Subscription Dialog */}
            <Dialog open={!!subscriptionDialog} onOpenChange={() => setSubscriptionDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Subscription</DialogTitle>
                        <DialogDescription>
                            Assign a subscription plan to {subscriptionDialog?.name}
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
                        <Button variant="outline" onClick={() => setSubscriptionDialog(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssignSubscription} disabled={!selectedPlan}>
                            Assign Subscription
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete {deleteDialog?.name}?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                            <p className="font-semibold">Warning: This action cannot be undone.</p>
                            <ul className="mt-2 list-disc list-inside space-y-1">
                                <li>User account will be permanently deleted</li>
                                <li>All associated data may be removed</li>
                                <li>Active subscriptions will be cancelled</li>
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
