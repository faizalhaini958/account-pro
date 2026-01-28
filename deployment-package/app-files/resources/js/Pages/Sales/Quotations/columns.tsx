"use client"

import { Link, useForm as useInertiaForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/Components/ui/badge"
import { Checkbox } from "@/Components/ui/checkbox"
import { Button } from "@/Components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"

// This type is used to define the shape of our data.
export type Quotation = {
    id: string
    number: string
    date: string
    customer: {
        name: string
    }
    total: number
    status: "draft" | "sent" | "accepted" | "rejected" | "expired"
}

export const columns: ColumnDef<Quotation>[] = [
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
            return "Reference"
        },
    },
    {
        accessorKey: "customer.name",
        header: () => {
            const { t } = useTranslation()
            return "Customer"
        },
    },
    {
        accessorKey: "total",
        header: () => {
            const { t } = useTranslation()
            return <div className="text-right">Amount</div>
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("total"))
            const formatted = new Intl.NumberFormat("en-MY", {
                style: "currency",
                currency: "MYR",
            }).format(amount)

            return <div className="text-right font-medium">{formatted}</div>
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
                <Badge variant={status === 'sent' ? 'secondary' : 'outline'}>{status}</Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const quotation = row.original

            return <ActionCell quotation={quotation} />
        },
    },
]

const ActionCell = ({ quotation }: { quotation: Quotation }) => {
    const { t } = useTranslation()
    const { delete: destroy } = useInertiaForm({})

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this quotation?")) {
            destroy(route("sales.quotations.destroy", quotation.id))
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
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(quotation.id)}
                >
                    Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href={route('sales.quotations.show', quotation.id)}>
                        View
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href={route('sales.quotations.edit', quotation.id)}>
                        Edit
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <a href={route('sales.quotations.pdf', quotation.id)} target="_blank">
                        Download PDF
                    </a>
                </DropdownMenuItem>

                {quotation.status === 'draft' && (
                    <DropdownMenuItem asChild>
                        <Link href={route('sales.quotations.mark-sent', quotation.id)} method="post" as="button" className="w-full text-left">
                            Mark as Sent
                        </Link>
                    </DropdownMenuItem>
                )}

                {(quotation.status === 'sent' || quotation.status === 'draft') && (
                    <DropdownMenuItem asChild>
                        <Link href={route('sales.quotations.mark-accepted', quotation.id)} method="post" as="button" className="w-full text-left">
                            Mark as Accepted
                        </Link>
                    </DropdownMenuItem>
                )}

                {(quotation.status === 'sent' || quotation.status === 'accepted') && (
                    <DropdownMenuItem asChild>
                        <Link href={route('sales.quotations.mark-rejected', quotation.id)} method="post" as="button" className="w-full text-left text-red-600 focus:text-red-600">
                            Mark as Rejected
                        </Link>
                    </DropdownMenuItem>
                )}

                {quotation.status === 'accepted' && (
                    <DropdownMenuItem asChild>
                        <Link href={route('sales.quotations.convert', quotation.id)} method="post" as="button" className="w-full text-left">
                            Convert to Invoice
                        </Link>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

