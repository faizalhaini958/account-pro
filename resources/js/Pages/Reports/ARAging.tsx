import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Download, FileText } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"

interface ARAgingProps {
    report: {
        aging: {
            current: Array<AgingInvoice>
            '1_30': Array<AgingInvoice>
            '31_60': Array<AgingInvoice>
            '61_90': Array<AgingInvoice>
            over_90: Array<AgingInvoice>
        }
        totals: {
            current: number
            '1_30': number
            '31_60': number
            '61_90': number
            over_90: number
        }
        grand_total: number
    }
}

interface AgingInvoice {
    invoice_number: string
    customer: string
    date: string
    due_date: string
    amount: number
    days_overdue: number
}

export default function ARAging({ report }: ARAgingProps) {
    const handleExport = (format: 'pdf' | 'csv') => {
        window.location.href = route('reports.ar-aging', { format })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR',
        }).format(amount)
    }

    const renderInvoiceTable = (invoices: AgingInvoice[]) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Days Overdue</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No invoices in this category
                        </TableCell>
                    </TableRow>
                ) : (
                    invoices.map((invoice) => (
                        <TableRow key={invoice.invoice_number}>
                            <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                            <TableCell>{invoice.customer}</TableCell>
                            <TableCell>{invoice.date}</TableCell>
                            <TableCell>{invoice.due_date}</TableCell>
                            <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                            <TableCell className="text-right">{invoice.days_overdue}</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )

    return (
        <DashboardLayout header="AR Aging Report">
            <Head title="AR Aging" />

            <div className="p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Current</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(report.totals.current)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>1-30 Days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {formatCurrency(report.totals['1_30'])}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>31-60 Days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {formatCurrency(report.totals['31_60'])}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>61-90 Days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(report.totals['61_90'])}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Over 90 Days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-800">
                                {formatCurrency(report.totals.over_90)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-primary text-primary-foreground">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-primary-foreground/80">Total AR</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(report.grand_total)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Export Buttons */}
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleExport('pdf')}>
                        <FileText className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('csv')}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Detailed Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Aging Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="current">
                            <TabsList>
                                <TabsTrigger value="current">Current</TabsTrigger>
                                <TabsTrigger value="1_30">1-30 Days</TabsTrigger>
                                <TabsTrigger value="31_60">31-60 Days</TabsTrigger>
                                <TabsTrigger value="61_90">61-90 Days</TabsTrigger>
                                <TabsTrigger value="over_90">Over 90 Days</TabsTrigger>
                            </TabsList>
                            <TabsContent value="current">{renderInvoiceTable(report.aging.current)}</TabsContent>
                            <TabsContent value="1_30">{renderInvoiceTable(report.aging['1_30'])}</TabsContent>
                            <TabsContent value="31_60">{renderInvoiceTable(report.aging['31_60'])}</TabsContent>
                            <TabsContent value="61_90">{renderInvoiceTable(report.aging['61_90'])}</TabsContent>
                            <TabsContent value="over_90">{renderInvoiceTable(report.aging.over_90)}</TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
