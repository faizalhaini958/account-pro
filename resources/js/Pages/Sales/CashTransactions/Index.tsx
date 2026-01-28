import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, useForm, router } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { DataTable } from "@/Components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/Components/ui/button"
import {
    Plus,
    CalendarIcon,
    Loader2,
    Upload,
    Banknote,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Receipt,
} from "lucide-react"
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
import { Textarea } from "@/Components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"
import { Calendar } from "@/Components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Badge } from "@/Components/ui/badge"

interface CashTransaction {
    id: number
    number: string
    type: "cash_sale" | "cash_expense"
    date: string
    description: string
    amount: number
    tax_amount: number
    total: number
    payment_method: string
    reference_number: string | null
    status: "draft" | "posted" | "void"
    receipt_url: string | null
    receipt_filename: string | null
    customer?: { id: number; name: string }
    supplier?: { id: number; name: string }
    expense_category?: { id: number; name: string }
    product?: { id: number; name: string }
    bank_account?: { id: number; bank_name: string; account_number: string }
}

interface Summary {
    total_sales: number
    total_expenses: number
    today_sales: number
    today_expenses: number
}

interface IndexProps {
    transactions: {
        data: CashTransaction[]
        links: any
        meta: any
    }
    summary: Summary
    filters: {
        type?: string
        search?: string
    }
    customers: Array<{ id: number; name: string }>
    suppliers: Array<{ id: number; name: string }>
    products: Array<{ id: number; name: string; retail_price?: number; sst_applicable?: boolean }>
    expenseCategories: Array<{ id: number; name: string }>
    bankAccounts: Array<{ id: number; bank_name: string; name: string; account_number: string }>
}

export default function Index({
    transactions,
    summary,
    filters,
    customers,
    suppliers,
    products,
    expenseCategories,
    bankAccounts,
}: IndexProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [transactionType, setTransactionType] = useState<"cash_sale" | "cash_expense">("cash_sale")
    const [receiptFile, setReceiptFile] = useState<File | null>(null)

    const { data, setData, post, processing, errors, reset, progress } = useForm({
        type: "cash_sale" as "cash_sale" | "cash_expense",
        date: new Date(),
        description: "",
        amount: 0,
        tax_amount: 0,
        payment_method: "cash",
        bank_account_id: "",
        reference_number: "",
        notes: "",
        customer_id: "",
        product_id: "",
        supplier_id: "",
        expense_category_id: "",
        receipt: null as File | null,
    })

    const handleTransactionTypeChange = (type: "cash_sale" | "cash_expense") => {
        setTransactionType(type)
        setData("type", type)
    }

    const handleProductChange = (productId: string) => {
        const product = products.find((p) => p.id.toString() === productId)
        if (product) {
            const taxRate = product.sst_applicable ? 8 : 0 // SST rate is 8%
            setData({
                ...data,
                product_id: productId,
                description: product.name,
                amount: product.retail_price || 0,
                tax_amount: ((product.retail_price || 0) * taxRate) / 100,
            })
        } else {
            setData("product_id", productId)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        setReceiptFile(file)
        setData("receipt", file)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append("type", data.type)
        formData.append("date", format(data.date, "yyyy-MM-dd"))
        formData.append("description", data.description)
        formData.append("amount", data.amount.toString())
        formData.append("tax_amount", data.tax_amount.toString())
        formData.append("payment_method", data.payment_method)
        if (data.bank_account_id) formData.append("bank_account_id", data.bank_account_id)
        if (data.reference_number) formData.append("reference_number", data.reference_number)
        if (data.notes) formData.append("notes", data.notes)
        if (data.type === "cash_sale") {
            if (data.customer_id) formData.append("customer_id", data.customer_id)
            if (data.product_id) formData.append("product_id", data.product_id)
        } else {
            if (data.supplier_id) formData.append("supplier_id", data.supplier_id)
            if (data.expense_category_id) formData.append("expense_category_id", data.expense_category_id)
        }
        if (receiptFile) formData.append("receipt", receiptFile)

        router.post(route("sales.cash-transactions.store"), formData, {
            forceFormData: true,
            onSuccess: () => {
                setOpen(false)
                reset()
                setReceiptFile(null)
            },
        })
    }

    const handleFilterChange = (type: string) => {
        router.get(route("sales.cash-transactions.index"), { type: type || undefined }, { preserveState: true })
    }

    const total = data.amount + data.tax_amount

    return (
        <DashboardLayout header={t("cashTransactions.title", "Cash Transactions")}>
            <Head title={t("cashTransactions.title", "Cash Transactions")} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                {/* Header */}
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {t("cashTransactions.title", "Cash Transactions")}
                    </h2>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                {t("cashTransactions.create", "New Transaction")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{t("cashTransactions.create", "New Cash Transaction")}</DialogTitle>
                                <DialogDescription>
                                    {t("cashTransactions.createDescription", "Record a cash sale or expense transaction")}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Transaction Type Toggle */}
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={transactionType === "cash_sale" ? "default" : "outline"}
                                        className="flex-1"
                                        onClick={() => handleTransactionTypeChange("cash_sale")}
                                    >
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                        {t("cashTransactions.cashSale", "Cash Sale")}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={transactionType === "cash_expense" ? "default" : "outline"}
                                        className="flex-1"
                                        onClick={() => handleTransactionTypeChange("cash_expense")}
                                    >
                                        <TrendingDown className="mr-2 h-4 w-4" />
                                        {t("cashTransactions.cashExpense", "Cash Expense")}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Date */}
                                    <div className="space-y-2">
                                        <Label>{t("common.date", "Date")}</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !data.date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.date ? format(data.date, "PPP") : t("common.selectDate", "Select date")}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={data.date}
                                                    onSelect={(date) => setData("date", date || new Date())}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-2">
                                        <Label>{t("common.paymentMethod", "Payment Method")}</Label>
                                        <Select value={data.payment_method} onValueChange={(v) => setData("payment_method", v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("common.selectPaymentMethod", "Select method")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">{t("paymentMethods.cash", "Cash")}</SelectItem>
                                                <SelectItem value="bank_transfer">{t("paymentMethods.bankTransfer", "Bank Transfer")}</SelectItem>
                                                <SelectItem value="cheque">{t("paymentMethods.cheque", "Cheque")}</SelectItem>
                                                <SelectItem value="credit_card">{t("paymentMethods.creditCard", "Credit Card")}</SelectItem>
                                                <SelectItem value="e_wallet">{t("paymentMethods.eWallet", "E-Wallet")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Conditional: Customer or Supplier */}
                                    {transactionType === "cash_sale" ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label>{t("sales.customer", "Customer")} ({t("common.optional", "Optional")})</Label>
                                                <Select value={data.customer_id} onValueChange={(v) => setData("customer_id", v)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t("sales.selectCustomer", "Select customer")} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {customers.map((customer) => (
                                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                                {customer.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{t("inventory.product", "Product")} ({t("common.optional", "Optional")})</Label>
                                                <Select value={data.product_id} onValueChange={handleProductChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t("inventory.selectProduct", "Select product")} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products.map((product) => (
                                                            <SelectItem key={product.id} value={product.id.toString()}>
                                                                {product.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <Label>{t("purchases.supplier", "Supplier")} ({t("common.optional", "Optional")})</Label>
                                                <Select value={data.supplier_id} onValueChange={(v) => setData("supplier_id", v)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t("purchases.selectSupplier", "Select supplier")} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {suppliers.map((supplier) => (
                                                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                                {supplier.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{t("purchases.expenseCategory", "Expense Category")}</Label>
                                                <Select
                                                    value={data.expense_category_id}
                                                    onValueChange={(v) => setData("expense_category_id", v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t("purchases.selectCategory", "Select category")} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {expenseCategories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )}

                                    {/* Bank Account (if not cash) */}
                                    {data.payment_method !== "cash" && (
                                        <div className="space-y-2">
                                            <Label>{t("accounting.bankAccount", "Bank Account")}</Label>
                                            <Select value={data.bank_account_id} onValueChange={(v) => setData("bank_account_id", v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("accounting.selectBankAccount", "Select account")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {bankAccounts.map((account) => (
                                                        <SelectItem key={account.id} value={account.id.toString()}>
                                                            {account.bank_name} - {account.account_number}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Reference Number */}
                                    <div className="space-y-2">
                                        <Label>{t("common.referenceNumber", "Reference Number")}</Label>
                                        <Input
                                            value={data.reference_number}
                                            onChange={(e) => setData("reference_number", e.target.value)}
                                            placeholder={t("common.referenceNumberPlaceholder", "Receipt/Invoice #")}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label>{t("common.description", "Description")} *</Label>
                                    <Input
                                        value={data.description}
                                        onChange={(e) => setData("description", e.target.value)}
                                        placeholder={t("cashTransactions.descriptionPlaceholder", "Enter transaction description")}
                                        required
                                    />
                                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                </div>

                                {/* Amount and Tax */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t("common.amount", "Amount")} *</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.amount}
                                            onChange={(e) => setData("amount", parseFloat(e.target.value) || 0)}
                                            required
                                        />
                                        {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t("common.tax", "Tax Amount")}</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.tax_amount}
                                            onChange={(e) => setData("tax_amount", parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t("common.total", "Total")}</Label>
                                        <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center font-medium">
                                            {formatCurrency(total)}
                                        </div>
                                    </div>
                                </div>

                                {/* Receipt Upload */}
                                <div className="space-y-2">
                                    <Label>{t("cashTransactions.uploadReceipt", "Upload Receipt/Document")}</Label>
                                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="receipt-upload"
                                        />
                                        <label htmlFor="receipt-upload" className="cursor-pointer">
                                            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                {receiptFile
                                                    ? receiptFile.name
                                                    : t("cashTransactions.dropReceipt", "Click to upload receipt (JPG, PNG, PDF up to 5MB)")}
                                            </p>
                                        </label>
                                        {receiptFile && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() => {
                                                    setReceiptFile(null)
                                                    setData("receipt", null)
                                                }}
                                            >
                                                {t("common.remove", "Remove")}
                                            </Button>
                                        )}
                                    </div>
                                    {progress && (
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-primary h-2.5 rounded-full"
                                                style={{ width: `${progress.percentage}%` }}
                                            ></div>
                                        </div>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <Label>{t("common.notes", "Notes")}</Label>
                                    <Textarea
                                        value={data.notes}
                                        onChange={(e) => setData("notes", e.target.value)}
                                        placeholder={t("common.notesPlaceholder", "Additional notes...")}
                                        rows={2}
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                        {t("common.cancel", "Cancel")}
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t("common.save", "Save Transaction")}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t("cashTransactions.totalSales", "Total Sales")}
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_sales)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t("cashTransactions.totalExpenses", "Total Expenses")}
                            </CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.total_expenses)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t("cashTransactions.todaySales", "Today's Sales")}
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.today_sales)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t("cashTransactions.todayExpenses", "Today's Expenses")}
                            </CardTitle>
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.today_expenses)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Tabs */}
                <Tabs defaultValue={filters.type || "all"} onValueChange={handleFilterChange}>
                    <TabsList>
                        <TabsTrigger value="all">{t("common.all", "All")}</TabsTrigger>
                        <TabsTrigger value="cash_sale">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            {t("cashTransactions.cashSales", "Cash Sales")}
                        </TabsTrigger>
                        <TabsTrigger value="cash_expense">
                            <TrendingDown className="mr-2 h-4 w-4" />
                            {t("cashTransactions.cashExpenses", "Cash Expenses")}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Transactions Table */}
                <DataTable columns={columns} data={transactions.data} />
            </div>
        </DashboardLayout>
    )
}
