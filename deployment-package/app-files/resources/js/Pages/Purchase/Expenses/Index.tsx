import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { DataTable } from "@/Components/ui/data-table"
import { getColumns } from "./columns" // Import getColumns
import { Button } from "@/Components/ui/button"
import { Plus, CalendarIcon } from "lucide-react"
import { useState, useMemo } from "react"
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

interface IndexProps {
    expenses: any
    categories: Array<{ id: number, name: string }>
    suppliers: Array<{ id: number, name: string }>
    bankAccounts: Array<{ id: number, bank_name: string, account_number: string }>
}

export default function Index({ expenses, categories, suppliers, bankAccounts }: IndexProps) {
    const [open, setOpen] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({
        date: new Date(),
        expense_category_id: "",
        amount: "",
        tax_amount: 0,
        reference_number: "",
        description: "",
        supplier_id: "0",
        bank_account_id: "",
        payment_method: "Bank Transfer",
    })

    const { t } = useTranslation()


    const columns = useMemo(() => getColumns(t), [t])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('purchase.expenses.store'), {
            onSuccess: () => {
                setOpen(false)
                reset()
            },
        })
    }

    return (
        <DashboardLayout header={t('expenses.title')}>
            <Head title={t('expenses.title')} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{t('expenses.title')}</h2>
                    <div className="flex items-center space-x-2">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('expenses.new')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{t('expenses.createTitle')}</DialogTitle>
                                    <DialogDescription>
                                        {t('expenses.createDesc')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left Column */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>{t('expenses.date')}</Label>
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
                                                                <span>{t('expenses.pickDate')}</span>
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
                                                <Label htmlFor="description">{t('expenses.description')}</Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) => setData("description", e.target.value)}
                                                    placeholder="e.g. Monthly office rent"
                                                />
                                                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="expense_category_id">{t('expenses.category')}</Label>
                                                <Select
                                                    value={data.expense_category_id}
                                                    onValueChange={(val) => setData("expense_category_id", val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('expenses.selectCategory')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories?.map((category) => (
                                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.expense_category_id && <p className="text-sm text-red-500">{errors.expense_category_id}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="supplier_id">{t('expenses.payee')}</Label>
                                                <Select
                                                    value={data.supplier_id}
                                                    onValueChange={(val) => setData("supplier_id", val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('expenses.selectSupplier')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">None / General</SelectItem>
                                                        {suppliers?.map((supplier) => (
                                                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                                {supplier.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.supplier_id && <p className="text-sm text-red-500">{errors.supplier_id}</p>}
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="amount">{t('expenses.amount')}</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    id="amount"
                                                    value={data.amount}
                                                    onChange={(e) => setData("amount", e.target.value)}
                                                />
                                                {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="bank_account_id">{t('expenses.paidFrom')}</Label>
                                                <Select
                                                    value={data.bank_account_id}
                                                    onValueChange={(val) => setData("bank_account_id", val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('expenses.selectAccount')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {bankAccounts?.map((account) => (
                                                            <SelectItem key={account.id} value={account.id.toString()}>
                                                                {account.bank_name} - {account.account_number || 'Cash'}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.bank_account_id && <p className="text-sm text-red-500">{errors.bank_account_id}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="reference_number">{t('expenses.reference')}</Label>
                                                <Input
                                                    id="reference_number"
                                                    value={data.reference_number}
                                                    onChange={(e) => setData("reference_number", e.target.value)}
                                                />
                                                {errors.reference_number && <p className="text-sm text-red-500">{errors.reference_number}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="payment_method">{t('expenses.paymentMethod')}</Label>
                                                <Select
                                                    value={data.payment_method}
                                                    onValueChange={(val) => setData("payment_method", val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('expenses.selectMethod')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                        <SelectItem value="Cash">Cash</SelectItem>
                                                        <SelectItem value="Cheque">Cheque</SelectItem>
                                                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                                                        <SelectItem value="DuitNow/QR">DuitNow/QR</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            {t('common.cancel')}
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {t('expenses.create')}
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
                        data={expenses.data}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
