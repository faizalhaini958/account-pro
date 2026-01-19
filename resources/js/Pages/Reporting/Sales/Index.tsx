import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, router } from "@inertiajs/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { formatCurrency } from "@/lib/format"
import { format } from "date-fns"
import { ArrowLeft, Printer, Search } from "lucide-react"
import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
    invoices: any[]
    summary: {
        total_sales: number
        total_tax: number
        total_paid: number
        total_outstanding: number
        invoice_count: number
    }
    chartData: any[]
    filters: {
        start_date: string
        end_date: string
    }
}

export default function SalesReport({ invoices, summary, chartData, filters }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date)
    const [endDate, setEndDate] = useState(filters.end_date)

    const handleSearch = () => {
        router.get(route('reporting.sales'), { start_date: startDate, end_date: endDate }, { preserveState: true })
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <DashboardLayout header="Sales Report">
            <Head title="Sales Report" />

            <div className="max-w-7xl mx-auto py-6 space-y-6 print:py-0 print:max-w-full">
                {/* Header & Filters (Hidden in Print) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                    <div className="flex gap-2 items-center">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-[150px]"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-[150px]"
                        />
                        <Button onClick={handleSearch} variant="secondary">
                            <Search className="h-4 w-4 mr-2" /> Filter
                        </Button>
                    </div>
                    <Button onClick={handlePrint} variant="outline">
                        <Printer className="h-4 w-4 mr-2" /> Print Report
                    </Button>
                </div>

                {/* Print Header */}
                <div className="hidden print:block mb-8 text-center">
                    <h1 className="text-3xl font-bold">Sales Report</h1>
                    <p className="text-muted-foreground">
                        Period: {format(new Date(startDate), "dd MMM yyyy")} - {format(new Date(endDate), "dd MMM yyyy")}
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.total_sales)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tax</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.total_tax)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.invoice_count}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600 font-mono">
                                {formatCurrency(summary.total_outstanding)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Chart (Hidden in Print usually unless specific styles applied, keeping strictly UI for now) */}
                <Card className="print:hidden">
                    <CardHeader>
                        <CardTitle>Sales Trend</CardTitle>
                        <CardDescription>Daily sales volume over the selected period.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => format(new Date(str), "dd MMM")}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(label) => format(new Date(label), "PPP")}
                                    formatter={(value: number | undefined) => formatCurrency(value || 0)}
                                />
                                <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Detailed Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Ref No.</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                    <TableHead className="text-right">Tax</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell>{format(new Date(invoice.date), "dd/MM/yyyy")}</TableCell>
                                        <TableCell>{invoice.reference_number}</TableCell>
                                        <TableCell>{invoice.customer.name}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(parseFloat(invoice.subtotal))}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(parseFloat(invoice.tax_amount))}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(parseFloat(invoice.total))}</TableCell>
                                        <TableCell className="capitalize">{invoice.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:block, .print\\:block * {
                        visibility: visible;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    /* Custom print visibility for layout */
                    .py-6, .py-6 * {
                         visibility: visible;
                    }
                    nav, header, aside, .print\\:hidden {
                        display: none;
                    }
                }
            `}</style>
        </DashboardLayout>
    )
}
