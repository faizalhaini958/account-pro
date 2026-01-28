import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, router, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    FileText,
    Upload,
    Trash2,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar,
    CreditCard,
    User,
    Building2,
    Tag,
    Receipt,
    Download,
} from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { format } from "date-fns"
import { useState } from "react"

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
    notes: string | null
    status: "draft" | "posted" | "void"
    receipt_url: string | null
    receipt_filename: string | null
    created_at: string
    updated_at: string
    customer?: { id: number; name: string; email?: string }
    supplier?: { id: number; name: string; email?: string }
    expense_category?: { id: number; name: string }
    product?: { id: number; name: string }
    bank_account?: { id: number; bank_name: string; name: string; account_number: string }
    journal_entry?: {
        id: number
        number: string
        lines: Array<{
            id: number
            account: { id: number; code: string; name: string }
            debit: number
            credit: number
        }>
    }
}

interface ShowProps {
    transaction: CashTransaction
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case "posted":
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Posted</Badge>
        case "void":
            return <Badge variant="destructive">Void</Badge>
        default:
            return <Badge variant="secondary">Draft</Badge>
    }
}

const formatPaymentMethod = (method: string) => {
    return method
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
}

export default function Show({ transaction }: ShowProps) {
    const { t } = useTranslation()
    const [uploading, setUploading] = useState(false)
    const isSale = transaction.type === "cash_sale"

    const handlePost = () => {
        router.post(route("sales.cash-transactions.post", transaction.id))
    }

    const handleVoid = () => {
        if (confirm("Are you sure you want to void this transaction?")) {
            router.post(route("sales.cash-transactions.void", transaction.id))
        }
    }

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this transaction?")) {
            router.delete(route("sales.cash-transactions.destroy", transaction.id))
        }
    }

    const handleUploadReceipt = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("receipt", file)

        router.post(route("sales.cash-transactions.upload-receipt", transaction.id), formData, {
            forceFormData: true,
            onFinish: () => setUploading(false),
        })
    }

    const handleRemoveReceipt = () => {
        if (confirm("Are you sure you want to remove this receipt?")) {
            router.delete(route("sales.cash-transactions.remove-receipt", transaction.id))
        }
    }

    return (
        <DashboardLayout header={t("cashTransactions.details", "Transaction Details")}>
            <Head title={`${transaction.number} - ${t("cashTransactions.title", "Cash Transaction")}`} />

            <div className="flex-1 space-y-6 p-8 pt-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route("sales.cash-transactions.index")}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-bold tracking-tight">{transaction.number}</h2>
                                {getStatusBadge(transaction.status)}
                                {isSale ? (
                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                        <TrendingUp className="mr-1 h-3 w-3" />
                                        Cash Sale
                                    </Badge>
                                ) : (
                                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                                        <TrendingDown className="mr-1 h-3 w-3" />
                                        Cash Expense
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">{transaction.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {transaction.status === "draft" && (
                            <>
                                <Button onClick={handlePost}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {t("common.post", "Post")}
                                </Button>
                                <Button variant="destructive" onClick={handleDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("common.delete", "Delete")}
                                </Button>
                            </>
                        )}
                        {transaction.status === "posted" && (
                            <Button variant="destructive" onClick={handleVoid}>
                                <XCircle className="mr-2 h-4 w-4" />
                                {t("common.void", "Void")}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Transaction Details */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>{t("cashTransactions.transactionDetails", "Transaction Details")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t("common.date", "Date")}</p>
                                        <p className="font-medium">{format(new Date(transaction.date), "dd MMMM yyyy")}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t("common.paymentMethod", "Payment Method")}</p>
                                        <p className="font-medium">{formatPaymentMethod(transaction.payment_method)}</p>
                                    </div>
                                </div>

                                {isSale && transaction.customer && (
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t("sales.customer", "Customer")}</p>
                                            <p className="font-medium">{transaction.customer.name}</p>
                                        </div>
                                    </div>
                                )}

                                {!isSale && transaction.supplier && (
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t("purchases.supplier", "Supplier")}</p>
                                            <p className="font-medium">{transaction.supplier.name}</p>
                                        </div>
                                    </div>
                                )}

                                {!isSale && transaction.expense_category && (
                                    <div className="flex items-center gap-3">
                                        <Tag className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t("purchases.expenseCategory", "Category")}</p>
                                            <p className="font-medium">{transaction.expense_category.name}</p>
                                        </div>
                                    </div>
                                )}

                                {isSale && transaction.product && (
                                    <div className="flex items-center gap-3">
                                        <Tag className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t("inventory.product", "Product")}</p>
                                            <p className="font-medium">{transaction.product.name}</p>
                                        </div>
                                    </div>
                                )}

                                {transaction.bank_account && (
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t("accounting.bankAccount", "Bank Account")}</p>
                                            <p className="font-medium">
                                                {transaction.bank_account.bank_name} - {transaction.bank_account.account_number}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {transaction.reference_number && (
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t("common.referenceNumber", "Reference")}</p>
                                            <p className="font-medium">{transaction.reference_number}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {transaction.notes && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-muted-foreground mb-1">{t("common.notes", "Notes")}</p>
                                    <p className="text-sm">{transaction.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Amount Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("common.amount", "Amount")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("common.subtotal", "Subtotal")}</span>
                                    <span>{formatCurrency(transaction.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("common.tax", "Tax")}</span>
                                    <span>{formatCurrency(transaction.tax_amount)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-3">
                                    <span className="font-semibold">{t("common.total", "Total")}</span>
                                    <span className={`text-xl font-bold ${isSale ? "text-green-600" : "text-red-600"}`}>
                                        {isSale ? "+" : "-"}
                                        {formatCurrency(transaction.total)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Receipt Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="h-5 w-5" />
                                    {t("cashTransactions.receipt", "Receipt / Document")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {transaction.receipt_url ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                            <FileText className="h-8 w-8 text-primary" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{transaction.receipt_filename}</p>
                                                <p className="text-sm text-muted-foreground">Uploaded document</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <a
                                                href={transaction.receipt_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1"
                                            >
                                                <Button variant="outline" className="w-full">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    {t("common.view", "View")}
                                                </Button>
                                            </a>
                                            <Button variant="destructive" size="icon" onClick={handleRemoveReceipt}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={handleUploadReceipt}
                                            className="hidden"
                                            id="receipt-upload"
                                            disabled={uploading}
                                        />
                                        <label htmlFor="receipt-upload" className="cursor-pointer">
                                            {uploading ? (
                                                <Loader2 className="mx-auto h-8 w-8 text-muted-foreground animate-spin" />
                                            ) : (
                                                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                            )}
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {uploading
                                                    ? t("common.uploading", "Uploading...")
                                                    : t("cashTransactions.uploadReceiptHint", "Click to upload receipt (JPG, PNG, PDF)")}
                                            </p>
                                        </label>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Journal Entry (if posted) */}
                {transaction.journal_entry && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("accounting.journalEntry", "Journal Entry")}</CardTitle>
                            <CardDescription>
                                {t("accounting.journalEntryNumber", "Entry")}: {transaction.journal_entry.number}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">{t("accounting.account", "Account")}</th>
                                        <th className="text-right py-2">{t("accounting.debit", "Debit")}</th>
                                        <th className="text-right py-2">{t("accounting.credit", "Credit")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transaction.journal_entry.lines.map((line) => (
                                        <tr key={line.id} className="border-b">
                                            <td className="py-2">
                                                {line.account.code} - {line.account.name}
                                            </td>
                                            <td className="text-right py-2">
                                                {line.debit > 0 ? formatCurrency(line.debit) : "-"}
                                            </td>
                                            <td className="text-right py-2">
                                                {line.credit > 0 ? formatCurrency(line.credit) : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
