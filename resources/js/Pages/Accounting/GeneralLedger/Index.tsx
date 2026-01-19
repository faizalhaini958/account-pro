import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, router } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { formatCurrency } from "@/lib/format"
import { format } from "date-fns"
import { Search, Printer, ArrowDownToLine } from "lucide-react"
import { useState } from "react"

interface Props {
    accounts: any[]
    filters: {
        account_id: string | null
        start_date: string
        end_date: string
    }
    ledger: {
        account: any
        opening_balance: number
        lines: any[]
    } | null
}

export default function Index({ accounts, filters, ledger }: Props) {
    const [params, setParams] = useState({
        account_id: filters.account_id || "",
        start_date: filters.start_date,
        end_date: filters.end_date,
    })

    const handleSearch = () => {
        router.get(route('accounting.general-ledger'), params as any, { preserveState: true })
    }

    // Running balance calculator
    let runningBalance = ledger ? ledger.opening_balance : 0

    return (
        <DashboardLayout header="General Ledger">
            <Head title="General Ledger" />

            <div className="flex-1 space-y-4 p-8 pt-6">

                {/* Filters */}
                <Card className="print:hidden">
                    <CardHeader className="pb-3">
                        <CardTitle>Filter Ledger</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-2 md:col-span-2">
                                <Label>Account</Label>
                                <Select
                                    value={params.account_id}
                                    onValueChange={val => setParams({ ...params, account_id: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id.toString()}>
                                                {acc.code} - {acc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={params.start_date}
                                    onChange={e => setParams({ ...params, start_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={params.end_date}
                                    onChange={e => setParams({ ...params, end_date: e.target.value })}
                                />
                            </div>
                            <div className="flex space-x-2">
                                <Button onClick={handleSearch} className="flex-1">
                                    <Search className="mr-2 h-4 w-4" /> View
                                </Button>
                                <Button variant="outline" onClick={() => window.print()}>
                                    <Printer className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Ledger Content */}
                {ledger ? (
                    <div className="space-y-4">
                        <Card>
                            {/* ... existing header and table ... */}
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{ledger.account.name}</CardTitle>
                                        <CardDescription>{ledger.account.code}</CardDescription>
                                    </div>
                                    <div className="text-right text-sm text-muted-foreground">
                                        Period: {format(new Date(filters.start_date), "dd MMM yyyy")} - {format(new Date(filters.end_date), "dd MMM yyyy")}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[120px]">Date</TableHead>
                                            <TableHead className="w-[150px]">Reference</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right w-[120px]">Debit</TableHead>
                                            <TableHead className="text-right w-[120px]">Credit</TableHead>
                                            <TableHead className="text-right w-[120px]">Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* Opening Balance Row */}
                                        <TableRow className="bg-muted/30 font-medium">
                                            <TableCell colSpan={3}>Opening Balance</TableCell>
                                            <TableCell className="text-right">
                                                {ledger.opening_balance > 0 ? formatCurrency(ledger.opening_balance) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {ledger.opening_balance < 0 ? formatCurrency(Math.abs(ledger.opening_balance)) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(ledger.opening_balance)}</TableCell>
                                        </TableRow>

                                        {/* Transaction Lines */}
                                        {ledger.lines.map((line: any) => {
                                            const debit = line.type === 'debit' ? parseFloat(line.amount) : 0
                                            const credit = line.type === 'credit' ? parseFloat(line.amount) : 0
                                            runningBalance += (debit - credit)

                                            return (
                                                <TableRow key={line.id}>
                                                    <TableCell>{format(new Date(line.journal_entry.date), "dd/MM/yyyy")}</TableCell>
                                                    <TableCell className="font-mono text-xs">{line.journal_entry.entry_number}</TableCell>
                                                    <TableCell className="max-w-[300px] truncate" title={line.description || line.journal_entry.description}>
                                                        {line.description || line.journal_entry.description}
                                                    </TableCell>
                                                    <TableCell className="text-right text-green-600">
                                                        {debit > 0 ? formatCurrency(debit) : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right text-orange-600">
                                                        {credit > 0 ? formatCurrency(credit) : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(runningBalance)}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}

                                        {/* Closing Balance Row */}
                                        <TableRow className="bg-muted font-bold border-t-2">
                                            <TableCell colSpan={5} className="text-right">Closing Balance</TableCell>
                                            <TableCell className="text-right">{formatCurrency(runningBalance)}</TableCell>
                                        </TableRow>

                                        {ledger.lines.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                                    No transactions found in this period.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                        Select an account to view the General Ledger.
                    </div>
                )}
            </div>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .py-6, .py-6 * {
                        visibility: visible;
                    }
                    nav, header, aside, .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </DashboardLayout>
    )
}
