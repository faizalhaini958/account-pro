import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, router } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Checkbox } from "@/Components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table"
import { useState } from "react"
import { CheckCircle2, XCircle } from "lucide-react"

interface BankAccount {
    id: number
    name: string
    account_number: string
    bank_name: string
    chart_of_account: {
        code: string
        name: string
    }
}

interface Transaction {
    id: number
    date: string
    reference: string
    description: string
    debit: number
    credit: number
    amount: number
    balance: number
    reconciled: boolean
}

interface ReconciliationProps {
    bankAccount: BankAccount
    transactions: Transaction[]
    bookBalance: number
    upToDate: string
}

export default function Reconciliation({ bankAccount, transactions, bookBalance, upToDate }: ReconciliationProps) {
    const [selectedTransactions, setSelectedTransactions] = useState<number[]>([])
    const [statementBalance, setStatementBalance] = useState<string>('')
    const [filterDate, setFilterDate] = useState(upToDate)

    const toggleTransaction = (id: number) => {
        setSelectedTransactions(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        )
    }

    const reconciledAmount = transactions
        .filter(t => selectedTransactions.includes(t.id))
        .reduce((sum, t) => sum + t.amount, 0)

    const difference = parseFloat(statementBalance || '0') - bookBalance

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR',
        }).format(amount)
    }

    const handleFilter = () => {
        router.get(route('accounting.bank-accounts.reconciliation', bankAccount.id), {
            up_to_date: filterDate,
        })
    }

    return (
        <DashboardLayout header="Bank Reconciliation">
            <Head title="Bank Reconciliation" />

            <div className="p-6 space-y-6">
                {/* Bank Account Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>{bankAccount.name}</CardTitle>
                        <CardDescription>
                            {bankAccount.bank_name} - {bankAccount.account_number}
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Reconciliation Period</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 items-end">
                            <div>
                                <Label htmlFor="up_to_date">Up to Date</Label>
                                <Input
                                    id="up_to_date"
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleFilter}>Apply</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Book Balance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(bookBalance)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Statement Balance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Input
                                type="number"
                                step="0.01"
                                value={statementBalance}
                                onChange={(e) => setStatementBalance(e.target.value)}
                                placeholder="Enter balance"
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Difference</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${Math.abs(difference) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(difference)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {Math.abs(difference) < 0.01 ? (
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="h-6 w-6" />
                                    <span className="font-semibold">Balanced</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-600">
                                    <XCircle className="h-6 w-6" />
                                    <span className="font-semibold">Not Balanced</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transactions</CardTitle>
                        <CardDescription>
                            Select transactions that appear on your bank statement
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12"></TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedTransactions.includes(transaction.id)}
                                                onCheckedChange={() => toggleTransaction(transaction.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{transaction.date}</TableCell>
                                        <TableCell>{transaction.reference}</TableCell>
                                        <TableCell>{transaction.description}</TableCell>
                                        <TableCell className="text-right">
                                            {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(transaction.balance)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
