"use client"

import { Link, useForm as useInertiaForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/Components/ui/badge"
import { Checkbox } from "@/Components/ui/checkbox"
import { Button } from "@/Components/ui/button"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { format } from "date-fns"

export type CreditNote = {
    id: string
    number: string
    date: string
    customer: {
        id: number
        name: string
        company_name?: string
    }
    total: number
    status: 'draft' | 'posted' | 'void'
    created_at: string
}

export const columns: ColumnDef<CreditNote>[] = [
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
        accessorKey: "number",
        header: ({ column }) => {
            const { t } = useTranslation()
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t('invoices.number')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="font-medium">{row.getValue("number")}</div>,
    },
    {
        accessorKey: "date",
        header: () => {
            const { t } = useTranslation()
            return t('sales.date')
        },
        cell: ({ row }) => {
            return <div>{format(new Date(row.getValue("date")), "dd MMM yyyy")}</div>
        },
    },
    {
        accessorKey: "customer.name",
        header: () => {
            const { t } = useTranslation()
            return t('sales.customer')
        },
        cell: ({ row }) => {
            const customer = row.original.customer
            return (
                <div>
                    <div className="font-medium">{customer.name}</div>
                    {customer.company_name && (
                        <div className="text-sm text-muted-foreground">{customer.company_name}</div>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "total",
        header: () => {
            const { t } = useTranslation()
            return t('sales.amount')
        },
        cell: ({ row }) => {
            const total = parseFloat(row.getValue("total"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "MYR",
                minimumFractionDigits: 2
            }).format(total)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "status",
        header: () => {
            const { t } = useTranslation()
            return t('sales.status')
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={
                    status === 'draft' ? 'outline' :
                        status === 'posted' ? 'default' :
                            status === 'void' ? 'destructive' :
                                'default'
                }>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const creditNote = row.original

            return <ActionCell creditNote={creditNote} />
        },
    },
]

const ActionCell = ({ creditNote }: { creditNote: CreditNote }) => {
    const { t } = useTranslation()
    const { delete: destroy } = useInertiaForm({})
    const { post } = useInertiaForm({})

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this credit note?")) {
            destroy(route("sales.credit-notes.destroy", creditNote.id))
        }
    }

    const handlePost = () => {
        if (confirm("Are you sure you want to post this credit note? This action cannot be undone.")) {
            post(route("sales.credit-notes.post", creditNote.id))
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
                    onClick={() => navigator.clipboard.writeText(creditNote.number)}
                >
                    Copy Number
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <a href={route('sales.credit-notes.pdf', creditNote.id)} target="_blank" rel="noopener noreferrer">
                        Download PDF
                    </a>
                </DropdownMenuItem>

                {creditNote.status === 'draft' && (
                    <>
                        <DropdownMenuItem onClick={handlePost}>
                            Post
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('sales.credit-notes.edit', creditNote.id)}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                            Delete
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
