"use client"

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
import { useTranslation } from "react-i18next"

export type PurchaseInvoice = {
    id: number
    date: string
    due_date: string
    reference_number: string
    total: number
    outstanding_amount: number
    status: 'draft' | 'posted' | 'paid' | 'void' | 'overdue'
    supplier: {
        name: string
    }
}

export const columns: ColumnDef<PurchaseInvoice>[] = [

    {
        accessorKey: "date",
        header: ({ column }) => {
            const { t } = useTranslation()
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t('purchaseInvoices.date')}
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
        accessorKey: "reference_number",
        header: ({ column }) => {
            const { t } = useTranslation()
            return t('purchaseInvoices.number')
        },
        cell: ({ row }) => <div className="font-mono font-medium">{row.getValue("reference_number")}</div>
    },
    {
        accessorKey: "supplier.name",
        header: ({ column }) => {
            const { t } = useTranslation()
            return t('purchaseInvoices.supplier')
        },
    },
    {
        accessorKey: "due_date",
        header: ({ column }) => {
            const { t } = useTranslation()
            return t('purchaseInvoices.dueDate')
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("due_date"))
            return <div className="text-muted-foreground text-sm">{format(date, "dd/MM/yyyy")}</div>
        }
    },
    {
        accessorKey: "total",
        header: ({ column }) => {
            const { t } = useTranslation()
            return (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {t('purchaseInvoices.grandTotal').replace(':', '')}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("total"))
            return <div className="text-right font-medium">{formatCurrency(amount)}</div>
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            const { t } = useTranslation()
            return t('purchaseInvoices.status')
        },
        cell: ({ row }) => {
            const status = row.original.status
            const variants: Record<string, string> = {
                draft: "bg-gray-100 text-gray-800 hover:bg-gray-100",
                posted: "bg-blue-100 text-blue-800 hover:bg-blue-100",
                paid: "bg-green-100 text-green-800 hover:bg-green-100",
                void: "bg-red-100 text-red-800 hover:bg-red-100",
                overdue: "bg-orange-100 text-orange-800 hover:bg-orange-100",
            }
            return <Badge className={variants[status] || "bg-gray-100"}>{status.toUpperCase()}</Badge>
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

const ActionCell = ({ invoice }: { invoice: PurchaseInvoice }) => {
    const { delete: destroy, post } = useInertiaForm({})
    const { t } = useTranslation()

    const handleDelete = () => {
        if (confirm(t('purchaseInvoices.deleteConfirmation'))) {
            destroy(route("purchase.invoices.destroy", invoice.id))
        }
    }

    const handlePost = () => {
        if (confirm(t('purchaseInvoices.postConfirmation'))) {
            post(route("purchase.invoices.post", invoice.id))
        }
    }

    const handleVoid = () => {
        if (confirm(t('purchaseInvoices.voidConfirmation'))) {
            post(route("purchase.invoices.void", invoice.id))
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
                <DropdownMenuLabel>{t('master.actions')}</DropdownMenuLabel>
                {invoice.status === 'draft' && (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href={route('purchase.invoices.edit', invoice.id)}>{t('common.edit')}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handlePost}>
                            {t('purchaseInvoices.post')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                            {t('common.delete')}
                        </DropdownMenuItem>
                    </>
                )}
                {invoice.status === 'posted' && (
                    <>
                        <DropdownMenuItem onClick={handleVoid} className="text-red-600 focus:text-red-600">
                            {t('purchaseInvoices.void')}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
