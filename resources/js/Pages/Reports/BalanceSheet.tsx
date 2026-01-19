import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, router } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Download, FileText } from "lucide-react"
import { useState } from "react"

interface BalanceSheetProps {
    report: {
        as_of_date: string
        assets: {
            accounts: Array<{
                account_code: string
                account_name: string
                amount: number
            }>
            total: number
        }
        liabilities: {
            accounts: Array<{
                account_code: string
                account_name: string
                amount: number
            }>
            total: number
        }
        equity: {
            accounts: Array<{
                account_code: string
                account_name: string
                amount: number
            }>
            total: number
        }
        total_liabilities_and_equity: number
    }
    filters: {
        as_of_date: string
    }
}

export default function BalanceSheet({ report, filters }: BalanceSheetProps) {
    const [asOfDate, setAsOfDate] = useState(filters.as_of_date)

    const handleFilter = () => {
        router.get(route('reports.balance-sheet'), {
            as_of_date: asOfDate,
        })
    }

    const handleExport = (format: 'pdf' | 'csv') => {
        window.location.href = route('reports.balance-sheet', {
            as_of_date: asOfDate,
            format,
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR',
        }).format(amount)
    }

    return (
        <DashboardLayout header="Balance Sheet">
            <Head title="Balance Sheet" />

            <div className="p-6 space-y-6">
                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="as_of_date">As of Date</Label>
                                <Input
                                    id="as_of_date"
                                    type="date"
                                    value={asOfDate}
                                    onChange={(e) => setAsOfDate(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <Button onClick={handleFilter}>Apply</Button>
                                <Button variant="outline" onClick={() => handleExport('pdf')}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    PDF
                                </Button>
                                <Button variant="outline" onClick={() => handleExport('csv')}>
                                    <Download className="mr-2 h-4 w-4" />
                                    CSV
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Report */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Assets */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assets</CardTitle>
                            <CardDescription>As of {report.as_of_date}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {report.assets.accounts.map((account) => (
                                    <div key={account.account_code} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {account.account_code} - {account.account_name}
                                        </span>
                                        <span>{formatCurrency(account.amount)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-semibold pt-2 border-t">
                                    <span>Total Assets</span>
                                    <span className="text-blue-600">{formatCurrency(report.assets.total)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Liabilities & Equity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Liabilities & Equity</CardTitle>
                            <CardDescription>As of {report.as_of_date}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Liabilities */}
                            <div>
                                <h4 className="font-semibold mb-2">Liabilities</h4>
                                <div className="space-y-2">
                                    {report.liabilities.accounts.map((account) => (
                                        <div key={account.account_code} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {account.account_code} - {account.account_name}
                                            </span>
                                            <span>{formatCurrency(account.amount)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between font-semibold pt-2 border-t">
                                        <span>Total Liabilities</span>
                                        <span>{formatCurrency(report.liabilities.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Equity */}
                            <div>
                                <h4 className="font-semibold mb-2">Equity</h4>
                                <div className="space-y-2">
                                    {report.equity.accounts.map((account) => (
                                        <div key={account.account_code} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {account.account_code} - {account.account_name}
                                            </span>
                                            <span>{formatCurrency(account.amount)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between font-semibold pt-2 border-t">
                                        <span>Total Equity</span>
                                        <span>{formatCurrency(report.equity.total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between font-bold pt-2 border-t-2">
                                <span>Total Liabilities & Equity</span>
                                <span className="text-blue-600">
                                    {formatCurrency(report.total_liabilities_and_equity)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
