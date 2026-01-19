import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { StatCard } from '@/Components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Package, FileText } from 'lucide-react';
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface DashboardProps {
    metrics: {
        sales_today: number;
        receivables: number;
        payables: number;
        low_stock: number;
    };
    chartData: Array<{
        date: string;
        total: number;
    }>;
    recentInvoices: Array<{
        id: number;
        number: string;
        customer?: {
            name: string;
        };
        date: string;
        total: number;
        status: string;
    }>;
}

export default function Dashboard({ metrics, chartData, recentInvoices }: DashboardProps) {
    const { t, i18n } = useTranslation();

    const formatCurrency = (amount: number) => {
        const locale = i18n.language === 'ms' ? 'ms-MY' : 'en-MY';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'MYR',
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-800',
            posted: 'bg-blue-100 text-blue-800',
            partial: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            overdue: 'bg-red-100 text-red-800',
            void: 'bg-gray-100 text-gray-500',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const maxSales = Math.max(...chartData.map(d => d.total), 1);

    return (
        <DashboardLayout header={t('nav.dashboard')}>
            <Head title={t('nav.dashboard')} />

            <div className="p-6 space-y-6">
                {/* Welcome Section */}
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.welcome')}</h2>
                    <p className="text-muted-foreground">
                        {t('dashboard.subtitle')}
                    </p>
                </div>

                {/* Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title={t('dashboard.salesToday')}
                        value={formatCurrency(metrics.sales_today)}
                        description={t('dashboard.desc.salesToday')}
                        icon={DollarSign}
                    />
                    <StatCard
                        title={t('dashboard.receivables')}
                        value={formatCurrency(metrics.receivables)}
                        description={t('dashboard.desc.receivables')}
                        icon={TrendingUp}
                        className="border-blue-200"
                    />
                    <StatCard
                        title={t('dashboard.payables')}
                        value={formatCurrency(metrics.payables)}
                        description={t('dashboard.desc.payables')}
                        icon={TrendingDown}
                        className="border-orange-200"
                    />
                    <StatCard
                        title={t('dashboard.lowStock')}
                        value={metrics.low_stock}
                        description={t('dashboard.desc.lowStock')}
                        icon={Package}
                        className={metrics.low_stock > 0 ? 'border-red-200' : ''}
                    />
                </div>

                {/* Charts and Recent Activity */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Sales Trend Chart */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>{t('dashboard.salesTrend')}</CardTitle>
                            <CardDescription>{t('dashboard.last7Days')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {chartData.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="w-20 text-sm text-muted-foreground">{item.date}</div>
                                        <div className="flex-1">
                                            <div className="h-8 bg-blue-100 rounded" style={{ width: `${(item.total / maxSales) * 100}%` }}>
                                                <div className="h-full bg-blue-500 rounded flex items-center justify-end pr-2">
                                                    <span className="text-xs text-white font-medium">
                                                        {formatCurrency(item.total)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Invoices */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>{t('dashboard.recentInvoices')}</CardTitle>
                            <CardDescription>{t('dashboard.latestInvoices')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentInvoices.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        {t('dashboard.noInvoices')}
                                    </p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t('sales.invoiceNumber')}</TableHead>
                                                <TableHead>{t('sales.customer')}</TableHead>
                                                <TableHead className="text-right">{t('sales.amount')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentInvoices.map((invoice) => (
                                                <TableRow key={invoice.id}>
                                                    <TableCell>
                                                        <Link
                                                            href={route('sales.invoices.show', invoice.id)}
                                                            className="font-medium hover:underline block"
                                                        >
                                                            {invoice.number}
                                                        </Link>
                                                        <div className="text-xs text-muted-foreground">
                                                            {format(new Date(invoice.date), "dd/MM/yyyy")}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {invoice.customer?.name || 'Unknown Customer'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(invoice.total)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('dashboard.quickActions')}</CardTitle>
                        <CardDescription>{t('dashboard.commonTasks')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                            <Link
                                href={route('sales.invoices.index')}
                                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                            >
                                <FileText className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">{t('sales.invoices')}</span>
                            </Link>
                            <Link
                                href={route('purchase.invoices.index')}
                                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                            >
                                <FileText className="h-5 w-5 text-orange-600" />
                                <span className="font-medium">{t('purchases.invoices')}</span>
                            </Link>
                            <Link
                                href={route('sales.receipts.index')}
                                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                            >
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <span className="font-medium">{t('sales.receipts')}</span>
                            </Link>
                            <Link
                                href={route('reports.profit-and-loss')}
                                className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                            >
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                                <span className="font-medium">{t('dashboard.viewReports')}</span>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
