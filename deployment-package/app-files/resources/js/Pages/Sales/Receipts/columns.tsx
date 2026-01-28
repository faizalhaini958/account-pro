"use client"

import { Link, useForm as useInertiaForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
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

export type Receipt = {
    id: number
    date: string
    number: string
    reference_number: string
    amount: number
    payment_method: string
    customer: {
        id: number
        name: string
    }
}

export const columns: ColumnDef<Receipt>[] = [
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
            const { t } = useTranslation()
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => format(new Date(row.getValue("date")), "dd/MM/yyyy"),
    },
    {
        accessorKey: "reference_number",
        header: () => "Receipt No.",
        cell: ({ row }) => <span className="font-mono">{row.original.number || row.getValue("reference_number")}</span>
    },
    {
        accessorKey: "customer.name",
        header: () => {
            const { t } = useTranslation()
            return "Customer"
        },
    },
    {
        accessorKey: "payment_method",
        header: () => {
            const { t } = useTranslation()
            return "Payment Method"
        },
        cell: ({ row }) => {
            const method = row.getValue("payment_method") as string
            return <span className="capitalize">{method.replace(/_/g, ' ')}</span>
        }
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            const { t } = useTranslation()
            return <div className="text-right">Amount</div>
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            return <div className="text-right font-medium">{formatCurrency(amount)}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const receipt = row.original

            return <ActionCell receipt={receipt} />
        },
    },
]

const ActionCell = ({ receipt }: { receipt: Receipt }) => {
    const { t } = useTranslation()
    const { delete: destroy } = useInertiaForm({})

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this receipt?")) {
            destroy(route("sales.receipts.destroy", receipt.id))
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
                    <Link href={route('sales.receipts.show', receipt.id)}>View</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a href={route('sales.receipts.pdf', receipt.id)} target="_blank" rel="noopener noreferrer">
                        Download PDF
                    </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
