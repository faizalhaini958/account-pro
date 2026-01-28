import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import {
    ArrowLeft,
    Loader2,
    Package,
    Plus,
    X,
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
}

interface SubscriptionPlanEditProps {
    plan: SubscriptionPlan;
}

export default function SubscriptionPlanEdit({ plan }: SubscriptionPlanEditProps) {
    const [newFeature, setNewFeature] = useState('');

    const { data, setData, patch, processing, errors } = useForm({
        code: plan.code,
        name: plan.name,
        description: plan.description || '',
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
        max_tenants: plan.max_tenants,
        max_users_per_tenant: plan.max_users_per_tenant,
        max_invoices_per_month: plan.max_invoices_per_month,
        features: plan.features || [],
        is_active: plan.is_active,
        sort_order: plan.sort_order,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('admin.subscription-plans.update', plan.id));
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setData('features', [...data.features, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setData('features', data.features.filter((_, i) => i !== index));
    };

    const calculateYearlySavings = () => {
        const monthlyTotal = data.price_monthly * 12;
        if (monthlyTotal <= 0 || data.price_yearly <= 0) return 0;
        return Math.round((1 - data.price_yearly / monthlyTotal) * 100);
    };

    return (
        <AdminLayout header="Edit Subscription Plan">
            <Head title={`Edit Plan: ${plan.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={route('admin.subscription-plans.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Edit Subscription Plan</h2>
                        <p className="text-muted-foreground">{plan.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Plan Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="code">Plan Code</Label>
                                            <Input
                                                id="code"
                                                value={data.code}
                                                onChange={(e) => setData('code', e.target.value.toLowerCase().replace(/\s/g, '_'))}
                                                placeholder="e.g., basic, pro, enterprise"
                                            />
                                            {errors.code && (
                                                <p className="text-sm text-destructive">{errors.code}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name">Display Name</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g., Basic Plan"
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-destructive">{errors.name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Brief description of this plan"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pricing */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="price_monthly">Monthly Price (MYR)</Label>
                                            <Input
                                                id="price_monthly"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.price_monthly}
                                                onChange={(e) => setData('price_monthly', parseFloat(e.target.value) || 0)}
                                            />
                                            {errors.price_monthly && (
                                                <p className="text-sm text-destructive">{errors.price_monthly}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="price_yearly">Yearly Price (MYR)</Label>
                                            <Input
                                                id="price_yearly"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.price_yearly}
                                                onChange={(e) => setData('price_yearly', parseFloat(e.target.value) || 0)}
                                            />
                                            {errors.price_yearly && (
                                                <p className="text-sm text-destructive">{errors.price_yearly}</p>
                                            )}
                                            {calculateYearlySavings() > 0 && (
                                                <p className="text-sm text-green-600">
                                                    {calculateYearlySavings()}% savings vs monthly
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Limits */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Usage Limits</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="max_tenants">Max Companies</Label>
                                            <Input
                                                id="max_tenants"
                                                type="number"
                                                min="1"
                                                value={data.max_tenants}
                                                onChange={(e) => setData('max_tenants', parseInt(e.target.value) || 1)}
                                            />
                                            {errors.max_tenants && (
                                                <p className="text-sm text-destructive">{errors.max_tenants}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="max_users_per_tenant">Max Users per Company</Label>
                                            <Input
                                                id="max_users_per_tenant"
                                                type="number"
                                                min="1"
                                                value={data.max_users_per_tenant}
                                                onChange={(e) => setData('max_users_per_tenant', parseInt(e.target.value) || 1)}
                                            />
                                            {errors.max_users_per_tenant && (
                                                <p className="text-sm text-destructive">{errors.max_users_per_tenant}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="max_invoices_per_month">Max Invoices/Month</Label>
                                            <Input
                                                id="max_invoices_per_month"
                                                type="number"
                                                min="1"
                                                value={data.max_invoices_per_month || ''}
                                                onChange={(e) => setData('max_invoices_per_month', e.target.value ? parseInt(e.target.value) : undefined)}
                                                placeholder="Unlimited"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Leave empty for unlimited
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Features */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Features</CardTitle>
                                    <CardDescription>
                                        List the features included in this plan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            value={newFeature}
                                            onChange={(e) => setNewFeature(e.target.value)}
                                            placeholder="Add a feature..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addFeature();
                                                }
                                            }}
                                        />
                                        <Button type="button" variant="secondary" onClick={addFeature}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {data.features.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {data.features.map((feature, index) => (
                                                <Badge key={index} variant="secondary" className="gap-1">
                                                    {feature}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFeature(index)}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Active</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Make plan available for selection
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label htmlFor="sort_order">Sort Order</Label>
                                        <Input
                                            id="sort_order"
                                            type="number"
                                            min="0"
                                            value={data.sort_order}
                                            onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Lower numbers appear first
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
