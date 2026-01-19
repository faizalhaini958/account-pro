import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { DataTable } from "@/Components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/Components/ui/button"
import { Plus, CalendarIcon, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"
import { Calendar } from "@/Components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import axios from "axios"
import { formatCurrency } from "@/lib/format"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"

type Invoice = {
    id: number
    reference_number: string
    date: string
    due_date: string
    total: number
    outstanding_amount: number
}

interface IndexProps {
    receipts: any
    customers: Array<{ id: number, name: string }>
    bankAccounts: Array<{ id: number, bank_name: string, account_number: string, name: string }>
}

export default function Index({ receipts, customers, bankAccounts }: IndexProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [outstandingInvoices, setOutstandingInvoices] = useState<Invoice[]>([])
    const [allocations, setAllocations] = useState<Record<number, number>>({})
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: "",
        bank_account_id: "",
        date: new Date(),
        reference_number: "",
        amount: 0,
        notes: "",
        payment_method: "Bank Transfer",
        allocations: [] as { invoice_id: number, amount: number }[],
    })

    const selectedCustomerId = data.customer_id
    const totalAmount = data.amount

    useEffect(() => {
        if (selectedCustomerId) {
            setIsLoadingInvoices(true)
            axios.get(route('sales.customers.outstanding-invoices', selectedCustomerId))
                .then(response => {
                    setOutstandingInvoices(response.data)
                    setAllocations({})
                })
                .catch(error => {
                    console.error("Failed to fetch invoices", error)
                    setOutstandingInvoices([])
                })
                .finally(() => setIsLoadingInvoices(false))
        } else {
            setOutstandingInvoices([])
            setAllocations({})
        }
    }, [selectedCustomerId])

    const handleAutoAllocate = () => {
        let remaining = totalAmount
        const newAllocations: Record<number, number> = {}

        outstandingInvoices.forEach(invoice => {
            if (remaining > 0) {
                const allocate = Math.min(parseFloat(invoice.outstanding_amount.toString()), remaining)
                newAllocations[invoice.id] = parseFloat(allocate.toFixed(2))
                remaining -= allocate
            }
        })

        setAllocations(newAllocations)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const allocationsArray = Object.entries(allocations).map(([invoiceId, amount]) => ({
            invoice_id: parseInt(invoiceId),
            amount: amount,
        })).filter(a => a.amount > 0)

        data.allocations = allocationsArray;

        post(route('sales.receipts.store'), {
            onSuccess: () => {
                setOpen(false)
                reset()
                setAllocations({})
                setOutstandingInvoices([])
            },
        })
    }

    const totalAllocated = Object.values(allocations).reduce((a, b) => a + b, 0)
    const unallocated = totalAmount - totalAllocated

    return (
        <DashboardLayout header={t('receipts.title')}>
            <Head title={t('receipts.title')} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{t('receipts.title')}</h2>
                    <div className="flex items-center space-x-2">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('receipts.create')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{t('receipts.create')}</DialogTitle>
                                    <DialogDescription>
                                        {t('receipts.new')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="customer_id">{t('sales.customer')}</Label>
                                            <Select
                                                value={data.customer_id}
                                                onValueChange={(val) => setData("customer_id", val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('user.selectCompany')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {customers?.map((customer) => (
                                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                                            {customer.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.customer_id && <p className="text-sm text-red-500">{errors.customer_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bank_account_id">{t('receipts.account')}</Label>
                                            <Select
                                                value={data.bank_account_id}
                                                onValueChange={(val) => setData("bank_account_id", val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('user.selectCompany')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {bankAccounts?.map((account) => (
                                                        <SelectItem key={account.id} value={account.id.toString()}>
                                                            {account.bank_name} - {account.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.bank_account_id && <p className="text-sm text-red-500">{errors.bank_account_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>{t('sales.date')}</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !data.date && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {data.date ? (
                                                            format(data.date, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={data.date}
                                                        onSelect={(date) => date && setData("date", date)}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reference_number">{t('receipts.reference')}</Label>
                                            <Input
                                                id="reference_number"
                                                value={data.reference_number}
                                                onChange={(e) => setData("reference_number", e.target.value)}
                                            />
                                            {errors.reference_number && <p className="text-sm text-red-500">{errors.reference_number}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="amount">{t('receipts.amountReceived')}</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                id="amount"
                                                value={data.amount}
                                                onChange={(e) => setData("amount", parseFloat(e.target.value))}
                                            />
                                            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="payment_method">{t('receipts.paymentMethod')}</Label>
                                            <Select
                                                value={data.payment_method}
                                                onValueChange={(val) => setData("payment_method", val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('common.search')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                    <SelectItem value="Cash">Cash</SelectItem>
                                                    <SelectItem value="Cheque">Cheque</SelectItem>
                                                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                                                    <SelectItem value="DuitNow/QR">DuitNow/QR</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.payment_method && <p className="text-sm text-red-500">{errors.payment_method}</p>}
                                        </div>

                                        <div className="col-span-1 md:col-span-2 space-y-2">
                                            <Label htmlFor="notes">{t('quotations.notes')}</Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={(e) => setData("notes", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Invoice Allocation */}
                                    {selectedCustomerId && (
                                        <div className="border rounded-md p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-lg">{t('receipts.allocateInvoices')}</h3>
                                                <Button type="button" variant="secondary" size="sm" onClick={handleAutoAllocate} disabled={totalAmount <= 0}>
                                                    {t('receipts.autoAllocate')}
                                                </Button>
                                            </div>

                                            {isLoadingInvoices ? (
                                                <div className="text-center py-4 flex items-center justify-center">
                                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                                    {t('common.loading')}
                                                </div>
                                            ) : outstandingInvoices.length === 0 ? (
                                                <div className="text-center py-4 text-muted-foreground">{t('receipts.noInvoices')}</div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>{t('invoices.number')}</TableHead>
                                                                <TableHead>{t('sales.date')}</TableHead>
                                                                <TableHead className="text-right">{t('sales.amount')}</TableHead>
                                                                <TableHead className="text-right">{t('receipts.outstanding')}</TableHead>
                                                                <TableHead className="w-[150px] text-right">{t('receipts.allocation')}</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {outstandingInvoices.map(invoice => (
                                                                <TableRow key={invoice.id}>
                                                                    <TableCell className="font-medium">{invoice.reference_number}</TableCell>
                                                                    <TableCell>{format(new Date(invoice.date), 'dd/MM/yyyy')}</TableCell>
                                                                    <TableCell className="text-right">{formatCurrency(parseFloat(invoice.total.toString()))}</TableCell>
                                                                    <TableCell className="text-right font-bold text-red-600">
                                                                        {formatCurrency(parseFloat(invoice.outstanding_amount.toString()))}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Input
                                                                            type="number"
                                                                            step="0.01"
                                                                            className="text-right h-8"
                                                                            value={allocations[invoice.id] || ''}
                                                                            onChange={(e) => {
                                                                                const val = parseFloat(e.target.value) || 0;
                                                                                setAllocations(prev => ({
                                                                                    ...prev,
                                                                                    [invoice.id]: Math.min(val, parseFloat(invoice.outstanding_amount.toString()))
                                                                                }))
                                                                            }}
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>

                                                    <div className="flex justify-end gap-6 text-sm border-t pt-4">
                                                        <div className="flex justify-between w-48">
                                                            <span>{t('receipts.receivedAmount')}:</span>
                                                            <span className="font-bold">{formatCurrency(totalAmount)}</span>
                                                        </div>
                                                        <div className="flex justify-between w-48">
                                                            <span>{t('receipts.allocated')}:</span>
                                                            <span className={cn("font-bold", totalAllocated > totalAmount ? "text-red-500" : "text-green-600")}>
                                                                {formatCurrency(totalAllocated)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between w-48">
                                                            <span>{t('receipts.unallocated')}:</span>
                                                            <span className="font-bold">{formatCurrency(unallocated)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            {t('common.cancel')}
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {t('receipts.create')}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                    <DataTable
                        columns={columns}
                        data={receipts.data}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
