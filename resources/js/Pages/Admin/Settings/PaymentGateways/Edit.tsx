import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Separator } from '@/Components/ui/separator';
import { Badge } from '@/Components/ui/badge';
import {
    ArrowLeft,
    CreditCard,
    Loader2,
    Key,
    Globe,
    Shield,
} from 'lucide-react';

interface PaymentGateway {
    id: number;
    code: string;
    name: string;
    description?: string;
    is_active: boolean;
    is_sandbox: boolean;
    config?: Record<string, any>;
    supported_currencies?: string[];
    min_amount?: number;
    max_amount?: number;
}

interface PaymentGatewayEditProps {
    gateway: PaymentGateway;
}

// Gateway-specific config fields
const gatewayConfigFields: Record<string, Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'url';
    placeholder: string;
    sensitive?: boolean;
    description?: string;
}>> = {
    kipple_pay: [
        { key: 'merchant_id', label: 'Merchant ID', type: 'text', placeholder: 'Your Kipple Merchant ID' },
        { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Your API Key', sensitive: true },
        { key: 'secret_key', label: 'Secret Key', type: 'password', placeholder: 'Your Secret Key', sensitive: true },
        { key: 'callback_url', label: 'Callback URL', type: 'url', placeholder: 'https://your-domain.com/payment/kipple/callback' },
        { key: 'redirect_url', label: 'Redirect URL', type: 'url', placeholder: 'https://your-domain.com/payment/kipple/redirect' },
    ],
    chip: [
        {
            key: 'brand_id',
            label: 'Brand ID',
            type: 'text',
            placeholder: 'Your CHIP Brand ID',
            description: '✅ Required: Get this from your CHIP dashboard'
        },
        {
            key: 'api_key',
            label: 'API Key',
            type: 'password',
            placeholder: 'Your API Key',
            sensitive: true,
            description: '✅ Required: Get this from your CHIP dashboard'
        },
        {
            key: 'webhook_secret',
            label: 'Webhook Secret (Public Key)',
            type: 'password',
            placeholder: 'Public key from CHIP webhook registration',
            sensitive: true,
            description: '⚠️ Optional: Only required if you enable webhook notifications. You receive this public key when registering your webhook URL in CHIP dashboard.'
        },
        {
            key: 'webhook_url',
            label: 'Webhook URL',
            type: 'url',
            placeholder: 'https://your-domain.com/payment/chip/webhook',
            description: '⚠️ Optional: Only required if you enable webhook notifications. Register this URL in your CHIP dashboard to receive payment status updates.'
        },
    ],
};

export default function PaymentGatewayEdit({ gateway }: PaymentGatewayEditProps) {
    const configFields = gatewayConfigFields[gateway.code] || [];

    const { data, setData, patch, processing, errors } = useForm({
        name: gateway.name,
        description: gateway.description || '',
        is_active: gateway.is_active,
        is_sandbox: gateway.is_sandbox,
        config: gateway.config || {},
        supported_currencies: gateway.supported_currencies || ['MYR'],
        min_amount: gateway.min_amount || '',
        max_amount: gateway.max_amount || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('admin.settings.payment-gateways.update', gateway.id));
    };

    const updateConfig = (key: string, value: string) => {
        setData('config', {
            ...data.config,
            [key]: value,
        });
    };

    const getGatewayIcon = (code: string) => {
        switch (code) {
            case 'kipple_pay':
                return '🏦';
            case 'chip':
                return '💳';
            default:
                return '💰';
        }
    };

    return (
        <AdminLayout header={`Configure ${gateway.name}`}>
            <Head title={`Configure ${gateway.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={route('admin.settings.payment-gateways')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <span className="text-4xl">{getGatewayIcon(gateway.code)}</span>
                            {gateway.name}
                        </h2>
                        <p className="text-muted-foreground">
                            Configure gateway credentials and settings
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Settings */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        General Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Display Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Brief description of this gateway"
                                        />
                                    </div>

                                    <Separator />

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="min_amount">Minimum Amount (MYR)</Label>
                                            <Input
                                                id="min_amount"
                                                type="number"
                                                step="0.01"
                                                value={data.min_amount}
                                                onChange={(e) => setData('min_amount', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="max_amount">Maximum Amount (MYR)</Label>
                                            <Input
                                                id="max_amount"
                                                type="number"
                                                step="0.01"
                                                value={data.max_amount}
                                                onChange={(e) => setData('max_amount', e.target.value)}
                                                placeholder="Unlimited"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* API Credentials */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="h-5 w-5" />
                                        API Credentials
                                    </CardTitle>
                                    <CardDescription>
                                        Enter your gateway API credentials. Sensitive fields are encrypted.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {configFields.length === 0 ? (
                                        <p className="text-muted-foreground">
                                            No configuration fields defined for this gateway.
                                        </p>
                                    ) : (
                                        configFields.map((field) => (
                                            <div key={field.key} className="space-y-2">
                                                <Label htmlFor={field.key} className="flex items-center gap-2">
                                                    {field.label}
                                                    {field.sensitive && (
                                                        <Shield className="h-3 w-3 text-muted-foreground" />
                                                    )}
                                                </Label>
                                                <Input
                                                    id={field.key}
                                                    type={field.type}
                                                    value={data.config[field.key] || ''}
                                                    onChange={(e) => updateConfig(field.key, e.target.value)}
                                                    placeholder={field.placeholder}
                                                />
                                                {field.description && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {field.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))
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
                                                Enable this gateway for payments
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Sandbox Mode</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Use test/sandbox environment
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_sandbox}
                                            onCheckedChange={(checked) => setData('is_sandbox', checked)}
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <Badge
                                            variant={data.is_sandbox ? 'secondary' : 'default'}
                                            className="w-full justify-center"
                                        >
                                            {data.is_sandbox ? '🧪 Sandbox Mode' : '🔴 Live Mode'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Supported Currencies</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {['MYR', 'USD', 'SGD'].map((currency) => (
                                            <Badge
                                                key={currency}
                                                variant={data.supported_currencies?.includes(currency) ? 'default' : 'outline'}
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    const currencies = data.supported_currencies || [];
                                                    if (currencies.includes(currency)) {
                                                        setData('supported_currencies', currencies.filter(c => c !== currency));
                                                    } else {
                                                        setData('supported_currencies', [...currencies, currency]);
                                                    }
                                                }}
                                            >
                                                {currency}
                                            </Badge>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Click to toggle currencies
                                    </p>
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
