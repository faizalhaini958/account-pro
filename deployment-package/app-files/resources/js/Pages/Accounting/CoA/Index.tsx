import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, router, useForm } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Badge } from "@/Components/ui/badge"
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, Loader2, Database } from "lucide-react"
import { useState } from "react"
import { formatCurrency } from "@/lib/format"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
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
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Switch } from "@/Components/ui/switch"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog"

interface Account {
    id: number
    code: string
    name: string
    type: string
    subtype: string | null
    parent_id: number | null
    is_system: boolean
    is_active: boolean
    parent?: Account
}

interface Props {
    accounts: Record<string, Account[]>
    parents: any[]
    types: Record<string, string>
}

export default function Index({ accounts, parents, types }: Props) {
    // Debug log to see what data is received
    console.log('COA accounts received:', accounts)
    console.log('COA total accounts:', Object.values(accounts || {}).reduce((sum, accs) => sum + (accs?.length || 0), 0))

    const typeLabels: Record<string, string> = {
        asset: 'Assets',
        liability: 'Liabilities',
        equity: 'Equity',
        income: 'Revenue / Income',
        cogs: 'Cost of Goods Sold',
        expense: 'Expenses',
    }

    const typeColors: Record<string, string> = {
        asset: 'text-blue-600',
        liability: 'text-red-600',
        equity: 'text-purple-600',
        income: 'text-green-600',
        cogs: 'text-orange-600',
        expense: 'text-orange-600',
    }

    const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({
        asset: true,
        liability: true,
        equity: true,
        income: true,
        cogs: true,
        expense: true,
    })

    const [open, setOpen] = useState(false)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [seedingDefaults, setSeedingDefaults] = useState(false)

    const { data, setData, post, processing, errors, reset } = useForm({
        code: "",
        name: "",
        type: "",
        subtype: "",
        parent_id: "",
        description: "",
        is_active: true,
    })

    // Calculate total accounts
    const totalAccounts = Object.values(accounts).reduce((sum, accs) => sum + (accs?.length || 0), 0)

    const toggleType = (type: string) => {
        setExpandedTypes(prev => ({ ...prev, [type]: !prev[type] }))
    }

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this account?')) {
            router.delete(route('accounting.coa.destroy', id))
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('accounting.coa.store'), {
            onSuccess: () => {
                setOpen(false)
                reset()
            },
        })
    }

    const handleSeedDefaults = () => {
        setConfirmDialogOpen(false)
        setSeedingDefaults(true)

        router.post(route('accounting.coa.seed-defaults'), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setSeedingDefaults(false)
                // Force page reload to show the new accounts
                router.reload()
            },
            onError: (errors) => {
                setSeedingDefaults(false)
                console.error('Error seeding defaults:', errors)
            },
            onFinish: () => {
                setSeedingDefaults(false)
            },
        })
    }

    return (
        <DashboardLayout header="Chart of Accounts">
            <Head title="Chart of Accounts" />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Chart of Accounts</h2>
                    <div className="flex items-center space-x-2">
                        {totalAccounts === 0 && (
                            <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" disabled={seedingDefaults}>
                                        {seedingDefaults && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Database className="mr-2 h-4 w-4" />
                                        Load Default GL Accounts
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Load Malaysian Default Chart of Accounts?</AlertDialogTitle>
                                        <AlertDialogDescription asChild>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <p className="font-semibold text-foreground">⚠️ This is a one-time action that cannot be undone easily.</p>
                                                <p>This will create a standard Chart of Accounts based on Malaysian accounting practices, including:</p>
                                                <ul className="list-disc list-inside space-y-1 mt-2 text-sm">
                                                    <li>Asset accounts (Bank, Cash, Inventory, Fixed Assets)</li>
                                                    <li>Liability accounts (Payables, Loans, Tax Payables)</li>
                                                    <li>Equity accounts (Capital, Retained Earnings)</li>
                                                    <li>Income/Revenue accounts</li>
                                                    <li>Cost of Goods Sold accounts</li>
                                                    <li>Expense accounts (including EPF, SOCSO, EIS)</li>
                                                </ul>
                                                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 rounded-md">
                                                    <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                                                        <strong>Important:</strong> This action can only be performed when the chart of accounts is empty.
                                                        Once loaded, you cannot automatically reload defaults. You can customize these accounts after creation.
                                                    </span>
                                                </div>
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleSeedDefaults} disabled={seedingDefaults}>
                                            {seedingDefaults ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Loading...
                                                </>
                                            ) : (
                                                'Yes, Load Defaults'
                                            )}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}

                        {/* Loading Modal */}
                        <Dialog open={seedingDefaults} onOpenChange={() => {}}>
                            <DialogContent className="sm:max-w-md" hideClose>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Loading Default Accounts
                                    </DialogTitle>
                                    <DialogDescription>
                                        Please wait while we create your default Chart of Accounts. This may take a few moments...
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex items-center justify-center py-6">
                                    <div className="text-center space-y-4">
                                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                                        <p className="text-sm text-muted-foreground">
                                            Creating 60+ default accounts for Malaysian businesses
                                        </p>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> New Account
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create New Account</DialogTitle>
                                    <DialogDescription>
                                        Add a new general ledger account to your chart of accounts.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="code">Account Code *</Label>
                                            <Input
                                                id="code"
                                                value={data.code}
                                                onChange={e => setData("code", e.target.value)}
                                                placeholder="e.g. 1001"
                                            />
                                            {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Account Type *</Label>
                                            <Select
                                                value={data.type}
                                                onValueChange={val => setData("type", val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(types || {}).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name">Account Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={e => setData("name", e.target.value)}
                                            placeholder="e.g. Petty Cash"
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="parent_id">Parent Account (Optional)</Label>
                                        <Select
                                            value={data.parent_id}
                                            onValueChange={val => setData("parent_id", val === "none" ? "" : val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select parent account (for nesting)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Parent</SelectItem>
                                                {parents?.map(p => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                        {p.code} - {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.parent_id && <p className="text-sm text-red-500">{errors.parent_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description (Optional)</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={e => setData("description", e.target.value)}
                                            placeholder="Internal notes about this account..."
                                        />
                                    </div>

                                    <div className="flex items-center justify-between border p-4 rounded-md">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Active Status</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Inactive accounts cannot be used in new transactions.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_active}
                                            onCheckedChange={val => setData("is_active", val)}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Create Account
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="space-y-4">
                    {Object.keys(typeLabels).map(type => (
                        <Card key={type}>
                            <CardHeader className="py-4 px-6 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleType(type)}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {expandedTypes[type] ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                                        <CardTitle className={typeColors[type]}>{typeLabels[type]}</CardTitle>
                                    </div>
                                    <Badge variant="outline">{accounts[type]?.length || 0} Accounts</Badge>
                                </div>
                            </CardHeader>
                            {expandedTypes[type] && (
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[100px] pl-6">Code</TableHead>
                                                <TableHead>Account Name</TableHead>
                                                <TableHead>Subtype</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right pr-6">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {accounts[type]?.map((account) => (
                                                <TableRow key={account.id}>
                                                    <TableCell className="font-medium pl-6">{account.code}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span>{account.name}</span>
                                                            {account.parent && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    Child of: {account.parent.code} - {account.parent.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="capitalize">{account.subtype?.replace('_', ' ') || '-'}</TableCell>
                                                    <TableCell>
                                                        {account.is_system ? (
                                                            <Badge variant="secondary" className="text-xs">System</Badge>
                                                        ) : (
                                                            <Badge variant={account.is_active ? "outline" : "destructive"}>
                                                                {account.is_active ? "Active" : "Inactive"}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('accounting.coa.edit', account.id)}>Edit Details</Link>
                                                                </DropdownMenuItem>
                                                                {!account.is_system && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleDelete(account.id)}
                                                                            className="text-red-600 focus:text-red-600"
                                                                        >
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {(!accounts[type] || accounts[type].length === 0) && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                                        No accounts found in this category.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}
