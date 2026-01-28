import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { Link, router } from "@inertiajs/react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Trash2, TrendingUp, TrendingDown, FileText, CheckCircle, XCircle } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { format } from "date-fns"

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

const getTypeBadge = (type: string) => {
    if (type === "cash_sale") {
        return (
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                <TrendingUp className="mr-1 h-3 w-3" />
                Sale
            </Badge>
        )
    }
    return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <TrendingDown className="mr-1 h-3 w-3" />
            Expense
        </Badge>
    )
}

const formatPaymentMethod = (method: string) => {
    return method
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
}

export const columns: ColumnDef<CashTransaction>[] = [
    {
        accessorKey: "number",
        header: "Number",
        cell: ({ row }) => (
            <Link
                href={route("sales.cash-transactions.show", row.original.id)}
                className="font-medium text-primary hover:underline"
            >
                {row.getValue("number")}
            </Link>
        ),
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => getTypeBadge(row.getValue("type")),
    },
    {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => format(new Date(row.getValue("date")), "dd MMM yyyy"),
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate" title={row.getValue("description")}>
                {row.getValue("description")}
            </div>
        ),
    },
    {
        id: "party",
        header: "Customer/Supplier",
        cell: ({ row }) => {
            const tx = row.original
            if (tx.type === "cash_sale" && tx.customer) {
                return tx.customer.name
            }
            if (tx.type === "cash_expense" && tx.supplier) {
                return tx.supplier.name
            }
            return <span className="text-muted-foreground">-</span>
        },
    },
    {
        accessorKey: "payment_method",
        header: "Payment",
        cell: ({ row }) => formatPaymentMethod(row.getValue("payment_method")),
    },
    {
        accessorKey: "total",
        header: () => <div className="text-right">Total</div>,
        cell: ({ row }) => {
            const tx = row.original
            const isExpense = tx.type === "cash_expense"
            return (
                <div className={`text-right font-medium ${isExpense ? "text-red-600" : "text-green-600"}`}>
                    {isExpense ? "-" : "+"}
                    {formatCurrency(tx.total)}
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
        id: "receipt",
        header: "Receipt",
        cell: ({ row }) => {
            const tx = row.original
            if (tx.receipt_url) {
                return (
                    <a
                        href={tx.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                    >
                        <FileText className="h-4 w-4" />
                        View
                    </a>
                )
            }
            return <span className="text-muted-foreground">-</span>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const tx = row.original

            const handleDelete = () => {
                if (confirm("Are you sure you want to delete this transaction?")) {
                    router.delete(route("sales.cash-transactions.destroy", tx.id))
                }
            }

            const handlePost = () => {
                router.post(route("sales.cash-transactions.post", tx.id))
            }

            const handleVoid = () => {
                if (confirm("Are you sure you want to void this transaction?")) {
                    router.post(route("sales.cash-transactions.void", tx.id))
                }
            }

            return (
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
                            <Link href={route("sales.cash-transactions.show", tx.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {tx.status === "draft" && (
                            <>
                                <DropdownMenuItem onClick={handlePost}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Post Transaction
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </>
                        )}
                        {tx.status === "posted" && (
                            <DropdownMenuItem onClick={handleVoid} className="text-destructive">
                                <XCircle className="mr-2 h-4 w-4" />
                                Void Transaction
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
