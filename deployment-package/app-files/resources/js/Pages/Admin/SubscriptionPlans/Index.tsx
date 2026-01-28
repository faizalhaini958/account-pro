import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Switch } from '@/Components/ui/switch';
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
    Package,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface SubscriptionPlan {
    id: number;
    code: string;
    name: string;
    description?: string;
    price_monthly: number;
    price_yearly: number;
    max_tenants: number;
    max_users_per_tenant: number;
    max_invoices_per_month?: number;
    features?: string[];
    is_active: boolean;
    sort_order: number;
    active_subscriptions_count: number;
}

interface SubscriptionPlansIndexProps {
    plans: SubscriptionPlan[];
}

export default function SubscriptionPlansIndex({ plans }: SubscriptionPlansIndexProps) {
    const handleToggle = (plan: SubscriptionPlan) => {
        router.post(route('admin.subscription-plans.toggle', plan.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (plan: SubscriptionPlan) => {
        if (plan.active_subscriptions_count > 0) {
            alert('Cannot delete plan with active subscriptions.');
            return;
        }

        if (confirm(`Are you sure you want to delete "${plan.name}"?`)) {
            router.delete(route('admin.subscription-plans.destroy', plan.id));
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AdminLayout header="Subscription Plans">
            <Head title="Subscription Plans" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
                        <p className="text-muted-foreground">
                            Manage subscription plans and pricing
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.subscription-plans.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Plan
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Plans ({plans.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {plans.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No subscription plans configured.</p>
                                <Button asChild className="mt-4">
                                    <Link href={route('admin.subscription-plans.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create First Plan
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Monthly Price</TableHead>
                                        <TableHead>Yearly Price</TableHead>
                                        <TableHead>Limits</TableHead>
                                        <TableHead>Subscribers</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {plans.map((plan) => (
                                        <TableRow key={plan.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{plan.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {plan.code}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(plan.price_monthly)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(plan.price_yearly)}
                                                {plan.price_yearly < plan.price_monthly * 12 && (
                                                    <Badge variant="secondary" className="ml-2 text-xs">
                                                        Save {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm space-y-1">
                                                    <div>{plan.max_tenants} companies</div>
                                                    <div>{plan.max_users_per_tenant} users/company</div>
                                                    <div>
                                                        {plan.max_invoices_per_month
                                                            ? `${plan.max_invoices_per_month} invoices/mo`
                                                            : 'Unlimited invoices'
                                                        }
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span>{plan.active_subscriptions_count}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={plan.is_active}
                                                        onCheckedChange={() => handleToggle(plan)}
                                                    />
                                                    <span className="text-sm">
                                                        {plan.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </TableCell>
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
                                                            <Link href={route('admin.subscription-plans.edit', plan.id)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(plan)}
                                                            className="text-destructive"
                                                            disabled={plan.active_subscriptions_count > 0}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Features Legend */}
                {plans.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Plan Features Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {plans.map((plan) => (
                                    <div key={plan.id} className="p-4 border rounded-lg">
                                        <h4 className="font-medium mb-2">{plan.name}</h4>
                                        {plan.features && plan.features.length > 0 ? (
                                            <ul className="text-sm space-y-1">
                                                {plan.features.map((feature, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <span className="text-green-500">✓</span>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No features defined</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
