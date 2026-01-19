import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, router } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Download, FileText, CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table"

interface TrialBalanceProps {
    report: {
        as_of_date: string
        accounts: Array<{
            account_code: string
            account_name: string
            account_type: string
            debit: number
            credit: number
        }>
        total_debit: number
        total_credit: number
        balanced: boolean
    }
    filters: {
        as_of_date: string
    }
}

export default function TrialBalance({ report, filters }: TrialBalanceProps) {
    const [asOfDate, setAsOfDate] = useState(filters.as_of_date)

    const handleFilter = () => {
        router.get(route('reports.trial-balance'), {
            as_of_date: asOfDate,
        })
    }

    const handleExport = (format: 'pdf' | 'csv') => {
        window.location.href = route('reports.trial-balance', {
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
        <DashboardLayout header="Trial Balance">
            <Head title="Trial Balance" />

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

                {/* Balance Status */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            {report.balanced ? (
                                <>
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="font-semibold text-green-600">Books are balanced</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-5 w-5 text-red-600" />
                                    <span className="font-semibold text-red-600">Books are NOT balanced</span>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Report */}
                <Card>
                    <CardHeader>
                        <CardTitle>Trial Balance</CardTitle>
                        <CardDescription>As of {report.as_of_date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account Code</TableHead>
                                    <TableHead>Account Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.accounts.map((account) => (
                                    <TableRow key={account.account_code}>
                                        <TableCell className="font-medium">{account.account_code}</TableCell>
                                        <TableCell>{account.account_name}</TableCell>
                                        <TableCell className="capitalize">{account.account_type}</TableCell>
                                        <TableCell className="text-right">
                                            {account.debit > 0 ? formatCurrency(account.debit) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {account.credit > 0 ? formatCurrency(account.credit) : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="font-bold border-t-2">
                                    <TableCell colSpan={3}>TOTALS</TableCell>
                                    <TableCell className="text-right">{formatCurrency(report.total_debit)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(report.total_credit)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
