import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, router } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Download, FileText } from "lucide-react"
import { useState } from "react"

interface ProfitAndLossProps {
    report: {
        period: {
            start: string
            end: string
        }
        income: {
            accounts: Array<{
                account_code: string
                account_name: string
                amount: number
            }>
            total: number
        }
        expenses: {
            accounts: Array<{
                account_code: string
                account_name: string
                amount: number
            }>
            total: number
        }
        net_profit: number
    }
    filters: {
        start_date: string
        end_date: string
    }
}

export default function ProfitAndLoss({ report, filters }: ProfitAndLossProps) {
    const [startDate, setStartDate] = useState(filters.start_date)
    const [endDate, setEndDate] = useState(filters.end_date)

    const handleFilter = () => {
        router.get(route('reports.profit-and-loss'), {
            start_date: startDate,
            end_date: endDate,
        })
    }

    const handleExport = (format: 'pdf' | 'csv') => {
        window.location.href = route('reports.profit-and-loss', {
            start_date: startDate,
            end_date: endDate,
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
        <DashboardLayout header="Profit & Loss">
            <Head title="Profit & Loss" />

            <div className="p-6 space-y-6">
                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
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
                <Card>
                    <CardHeader>
                        <CardTitle>Profit & Loss Statement</CardTitle>
                        <CardDescription>
                            For the period {report.period.start} to {report.period.end}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Income Section */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-lg mb-3">Income</h3>
                            <div className="space-y-2">
                                {report.income.accounts.map((account) => (
                                    <div key={account.account_code} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {account.account_code} - {account.account_name}
                                        </span>
                                        <span>{formatCurrency(account.amount)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-semibold pt-2 border-t">
                                    <span>Total Income</span>
                                    <span className="text-green-600">{formatCurrency(report.income.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Expenses Section */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-lg mb-3">Expenses</h3>
                            <div className="space-y-2">
                                {report.expenses.accounts.map((account) => (
                                    <div key={account.account_code} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {account.account_code} - {account.account_name}
                                        </span>
                                        <span>{formatCurrency(account.amount)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-semibold pt-2 border-t">
                                    <span>Total Expenses</span>
                                    <span className="text-red-600">{formatCurrency(report.expenses.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Net Profit */}
                        <div className="flex justify-between text-xl font-bold pt-4 border-t-2">
                            <span>Net Profit</span>
                            <span className={report.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {formatCurrency(report.net_profit)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
