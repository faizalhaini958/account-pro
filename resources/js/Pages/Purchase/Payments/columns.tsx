import { Link, useForm as useInertiaForm } from "@inertiajs/react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/Components/ui/badge"
import { Checkbox } from "@/Components/ui/checkbox"
import { Button } from "@/Components/ui/button"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { format } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { useTranslation } from "react-i18next";

export type SupplierPayment = {
    id: number
    date: string
    number: string
    reference_number: string
    amount: number
    payment_method: string
    supplier: {
        name: string
    }
}

export const getColumns = (t: any): ColumnDef<SupplierPayment>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t('payments.date')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("date"))
            return <div>{format(date, "dd/MM/yyyy")}</div>
        },
    },
    {
        accessorKey: "number",
        header: "Payment #",
        cell: ({ row }) => <span className="font-mono">{row.getValue("number")}</span>,
    },
    {
        accessorKey: "supplier.name",
        header: () => {
            return t('payments.supplier')
        },
    },
    {
        accessorKey: "reference_number",
        header: "Reference",
        cell: ({ row }) => <div className="text-xs text-muted-foreground">{row.getValue("reference_number") || "-"}</div>
    },
    {
        accessorKey: "payment_method",
        header: () => {
            return t('payments.method')
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => { // Keep sorting as it is useful feature, just fix styling if needed
            return (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {t('payments.amount')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            return <div className="text-right font-medium">{formatCurrency(amount)}</div>
        },
    },
    {
        id: "status",
        header: "Status",
        cell: () => (
            <Badge className="bg-green-600 text-white hover:bg-green-700">
                PAID
            </Badge>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const payment = row.original

            return <ActionCell payment={payment} />
        },
    },
]

const ActionCell = ({ payment }: { payment: SupplierPayment }) => {
    const { delete: destroy } = useInertiaForm({})
    const { t } = useTranslation()

    const handleDelete = () => {
        if (confirm(t('payments.deleteConfirmation'))) {
            destroy(route("purchase.payments.destroy", payment.id))
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
                    <Link href={route('purchase.payments.show', payment.id)}>{t('common.viewDetails')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    {t('common.delete')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
