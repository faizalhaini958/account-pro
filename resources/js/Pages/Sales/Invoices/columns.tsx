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

export type Invoice = {
    id: number
    date: string
    due_date: string
    reference_number: string
    total: number
    status: 'draft' | 'posted' | 'paid' | 'partial' | 'void' | 'overdue'
    customer: {
        id: number
        name: string
    }
}

export const columns: ColumnDef<Invoice>[] = [
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
        accessorKey: "number",
        header: () => {
            const { t } = useTranslation()
            return "Invoice #"
        },
        cell: ({ row }) => <span className="font-mono">{row.getValue("number")}</span>
    },
    {
        accessorKey: "customer.name",
        header: () => {
            const { t } = useTranslation()
            return "Customer"
        },
    },
    {
        accessorKey: "due_date",
        header: () => {
            const { t } = useTranslation()
            return "Due Date"
        },
        cell: ({ row }) => format(new Date(row.getValue("due_date")), "dd/MM/yyyy"),
    },
    {
        accessorKey: "total",
        header: ({ column }) => {
            const { t } = useTranslation()
            return <div className="text-right">Amount</div>
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("total"))
            return <div className="text-right font-medium">{formatCurrency(amount)}</div>
        },
    },
    {
        accessorKey: "status",
        header: () => {
            const { t } = useTranslation()
            return "Status"
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={
                    status === 'paid' ? "success" : // Will need to define success variant or use className
                        status === 'posted' ? "secondary" :
                            status === 'draft' ? "outline" :
                                "destructive"
                } className={status === 'paid' ? 'bg-green-600 text-white hover:bg-green-700' : ''}>
                    {status.toUpperCase()}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const invoice = row.original

            return <ActionCell invoice={invoice} />
        },
    },
]

const ActionCell = ({ invoice }: { invoice: Invoice }) => {
    const { t } = useTranslation()
    const { delete: destroy, post } = useInertiaForm({})

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this invoice?")) {
            destroy(route("sales.invoices.destroy", invoice.id))
        }
    }

    const handlePost = () => {
        if (confirm("Are you sure you want to post this invoice? This action cannot be fully undone.")) {
            post(route("sales.invoices.post", invoice.id))
        }
    }

    const handleVoid = () => {
        if (confirm("Are you sure you want to void this invoice?")) {
            post(route("sales.invoices.void", invoice.id))
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
                    <Link href={route('sales.invoices.show', invoice.id)}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a href={route('sales.invoices.pdf', invoice.id)} target="_blank">Download PDF</a>
                </DropdownMenuItem>

                {['posted', 'partial', 'overdue'].includes(invoice.status) && (
                    <DropdownMenuItem asChild>
                        <Link href={route('sales.invoices.payment', invoice.id)}>Record Payment</Link>
                    </DropdownMenuItem>
                )}

                {invoice.status === 'draft' && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={route('sales.invoices.edit', invoice.id)}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handlePost}>
                            Post Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                            Delete
                        </DropdownMenuItem>
                    </>
                )}
                {invoice.status === 'posted' && (
                    <DropdownMenuItem onClick={handleVoid} className="text-red-600 focus:text-red-600">
                        Void Invoice
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
