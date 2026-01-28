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
    CreditCard,
    Settings,
    Zap,
    TestTube,
} from 'lucide-react';

interface PaymentGateway {
    id: number;
    code: string;
    name: string;
    description?: string;
    is_active: boolean;
    is_sandbox: boolean;
    supported_currencies?: string[];
    min_amount?: number;
    max_amount?: number;
    created_at: string;
    updated_at: string;
}

interface PaymentGatewaysIndexProps {
    gateways: PaymentGateway[];
}

export default function PaymentGatewaysIndex({ gateways }: PaymentGatewaysIndexProps) {
    const handleToggle = (gateway: PaymentGateway) => {
        router.post(route('admin.settings.payment-gateways.toggle', gateway.id), {}, {
            preserveScroll: true,
        });
    };

    const handleTest = (gateway: PaymentGateway) => {
        router.post(route('admin.settings.payment-gateways.test', gateway.id), {}, {
            preserveScroll: true,
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
        <AdminLayout header="Payment Gateways">
            <Head title="Payment Gateways" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Payment Gateways</h2>
                    <p className="text-muted-foreground">
                        Configure payment gateway integrations for subscription billing
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Available Gateways
                        </CardTitle>
                        <CardDescription>
                            Manage your payment gateway configurations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {gateways.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No payment gateways configured.</p>
                                <p className="text-sm">Run the seeder to add default gateways.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Gateway</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead>Currencies</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {gateways.map((gateway) => (
                                        <TableRow key={gateway.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{getGatewayIcon(gateway.code)}</span>
                                                    <div>
                                                        <div className="font-medium">{gateway.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {gateway.code}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {gateway.description || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={gateway.is_sandbox ? 'secondary' : 'default'}>
                                                    {gateway.is_sandbox ? 'Sandbox' : 'Live'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {gateway.supported_currencies?.length ? (
                                                    <div className="flex gap-1">
                                                        {gateway.supported_currencies.slice(0, 3).map((currency) => (
                                                            <Badge key={currency} variant="outline">
                                                                {currency}
                                                            </Badge>
                                                        ))}
                                                        {gateway.supported_currencies.length > 3 && (
                                                            <Badge variant="outline">
                                                                +{gateway.supported_currencies.length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">All</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={gateway.is_active}
                                                        onCheckedChange={() => handleToggle(gateway)}
                                                    />
                                                    <span className="text-sm">
                                                        {gateway.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleTest(gateway)}
                                                    >
                                                        <TestTube className="h-4 w-4 mr-1" />
                                                        Test
                                                    </Button>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={route('admin.settings.payment-gateways.edit', gateway.id)}>
                                                            <Settings className="h-4 w-4 mr-1" />
                                                            Configure
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Gateway Info Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">🏦</span>
                                UiTM Kipple Pay v1.6
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="text-muted-foreground">
                                Malaysian e-wallet payment gateway specifically designed for UiTM ecosystem.
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                <li>Supports FPX, E-Wallet, and Card payments</li>
                                <li>Real-time payment notifications</li>
                                <li>MYR currency only</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="text-2xl">💳</span>
                                CHIP Payment Gateway
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="text-muted-foreground">
                                Modern payment infrastructure for Malaysian businesses.
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                <li>FPX, Cards, E-Wallets, BNPL</li>
                                <li>Recurring payments support</li>
                                <li>Multi-currency support</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
