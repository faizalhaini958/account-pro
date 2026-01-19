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
import { useTranslation } from "react-i18next";

export type Expense = {
    id: number
    date: string
    reference_number?: string
    description: string
    amount: number
    status: string
    category: {
        name: string
    }
    supplier?: {
        name: string
    }
}

export const getColumns = (t: any): ColumnDef<Expense>[] => [
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t('expenses.date')}
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
        header: () => {
            return t('expenses.reference')
        },
        cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("reference_number") || '-'}</div>
    },
    {
        id: "payee_description",
        header: () => {
            return "Payee / Description"
        },
        cell: ({ row }) => {
            const expense = row.original
            return (
                <div>
                    <div className="font-medium">{expense.supplier ? expense.supplier.name : t('expenses.generalExpense')}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[250px]">{expense.description}</div>
                </div>
            )
        },
    },
    {
        accessorKey: "category.name",
        header: () => {
            return t('expenses.category')
        },
        cell: ({ row }) => <Badge variant="secondary">{row.original.category.name}</Badge>
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {t('expenses.amount')}
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
        id: "actions",
        cell: ({ row }) => {
            const expense = row.original

            return <ActionCell expense={expense} />
        },
    },
]

const ActionCell = ({ expense }: { expense: Expense }) => {
    const { delete: destroy } = useInertiaForm({})
    const { t } = useTranslation()

    const handleDelete = () => {
        if (confirm(t('expenses.deleteConfirmation'))) {
            destroy(route("purchase.expenses.destroy", expense.id))
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
                    <Link href={route('purchase.expenses.edit', expense.id)}>{t('common.edit')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    {t('common.delete')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
