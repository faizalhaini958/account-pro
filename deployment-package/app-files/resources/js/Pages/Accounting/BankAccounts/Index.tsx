import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, useForm } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { DataTable } from "@/Components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2, FileText, GitCompare, Plus } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { router } from "@inertiajs/react"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Checkbox } from "@/Components/ui/checkbox"

interface BankAccount {
    id: number
    name: string
    account_number: string
    bank_name: string
    chart_of_account: {
        code: string
        name: string
    }
    balance: number
    is_active: boolean
}

interface ChartOfAccount {
    id: number
    code: string
    name: string
}

interface BankAccountsIndexProps {
    bankAccounts: BankAccount[]
    chartOfAccounts: ChartOfAccount[]
}

export default function BankAccountsIndex({ bankAccounts, chartOfAccounts }: BankAccountsIndexProps) {
    const [open, setOpen] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        account_number: '',
        bank_name: '',
        chart_of_account_id: '',
        is_active: true,
    })

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR',
        }).format(amount)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('accounting.bank-accounts.store'), {
            onSuccess: () => {
                setOpen(false)
                reset()
            },
        })
    }

    const columns: ColumnDef<BankAccount>[] = [
        {
            accessorKey: "name",
            header: "Account Name",
        },
        {
            accessorKey: "bank_name",
            header: "Bank",
        },
        {
            accessorKey: "account_number",
            header: "Account Number",
        },
        {
            accessorKey: "chart_of_account",
            header: "GL Account",
            cell: ({ row }) => {
                const coa = row.original.chart_of_account
                return `${coa.code} - ${coa.name}`
            },
        },
        {
            accessorKey: "balance",
            header: "Balance",
            cell: ({ row }) => formatCurrency(row.original.balance),
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded text-xs ${row.original.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const account = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={route('accounting.bank-accounts.statement', account.id)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Statement
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={route('accounting.bank-accounts.reconciliation', account.id)}>
                                    <GitCompare className="mr-2 h-4 w-4" />
                                    Reconciliation
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={route('accounting.bank-accounts.edit', account.id)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this bank account?')) {
                                        router.delete(route('accounting.bank-accounts.destroy', account.id))
                                    }
                                }}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return (
        <DashboardLayout header="Bank Accounts">
            <Head title="Bank Accounts" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Bank Accounts</h2>
                        <p className="text-muted-foreground">Manage your bank accounts</p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Bank Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create Bank Account</DialogTitle>
                                <DialogDescription>
                                    Add a new bank account to track your finances.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Account Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., Main Operating Account"
                                            required
                                        />
                                        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="bank_name">Bank Name *</Label>
                                        <Input
                                            id="bank_name"
                                            value={data.bank_name}
                                            onChange={(e) => setData('bank_name', e.target.value)}
                                            placeholder="e.g., Maybank"
                                            required
                                        />
                                        {errors.bank_name && <p className="text-sm text-red-600 mt-1">{errors.bank_name}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="account_number">Account Number *</Label>
                                        <Input
                                            id="account_number"
                                            value={data.account_number}
                                            onChange={(e) => setData('account_number', e.target.value)}
                                            placeholder="e.g., 1234567890"
                                            required
                                        />
                                        {errors.account_number && <p className="text-sm text-red-600 mt-1">{errors.account_number}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="chart_of_account_id">GL Account *</Label>
                                        <Select
                                            value={data.chart_of_account_id.toString()}
                                            onValueChange={(value) => setData('chart_of_account_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select GL Account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {chartOfAccounts?.map((account) => (
                                                    <SelectItem key={account.id} value={account.id.toString()}>
                                                        {account.code} - {account.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.chart_of_account_id && <p className="text-sm text-red-600 mt-1">{errors.chart_of_account_id}</p>}
                                    </div>

                                    <div className="col-span-2 flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            Active
                                        </Label>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Create Bank Account
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <DataTable columns={columns} data={bankAccounts} />
            </div>
        </DashboardLayout>
    )
}
