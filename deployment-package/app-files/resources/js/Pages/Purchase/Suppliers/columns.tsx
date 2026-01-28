"use client"

import { Link, useForm as useInertiaForm } from "@inertiajs/react"
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
import { useTranslation } from "react-i18next";

export type Supplier = {
    id: number
    name: string
    company_name?: string
    email?: string
    phone?: string
    city?: string
    is_active: boolean
}

export const columns: ColumnDef<Supplier>[] = [

    {
        accessorKey: "name",
        header: ({ column }) => {
            const { t } = useTranslation();
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t('suppliers.contactName')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const supplier = row.original
            return (
                <div>
                    <div className="font-medium">{supplier.name}</div>
                    {supplier.company_name && (
                        <div className="text-sm text-muted-foreground">{supplier.company_name}</div>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "email",
        header: () => {
            const { t } = useTranslation();
            return t('suppliers.contact')
        },
        cell: ({ row }) => {
            const supplier = row.original
            return (
                <div className="text-sm">
                    <div>{supplier.email}</div>
                    <div className="text-muted-foreground">{supplier.phone}</div>
                </div>
            )
        },
    },
    {
        accessorKey: "city",
        header: () => {
            const { t } = useTranslation();
            return t('suppliers.location')
        },
    },
    {
        accessorKey: "is_active",
        header: () => {
            const { t } = useTranslation();
            return t('suppliers.status')
        },
        cell: ({ row }) => {
            const { t } = useTranslation();
            return row.original.is_active ?
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{t('user.active')}</Badge> :
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const supplier = row.original

            return <ActionCell supplier={supplier} />
        },
    },
]

const ActionCell = ({ supplier }: { supplier: Supplier }) => {
    const { delete: destroy } = useInertiaForm({})
    const { t } = useTranslation();

    const handleDelete = () => {
        if (confirm(t('suppliers.deleteConfirmation'))) {
            destroy(route("purchase.suppliers.destroy", supplier.id))
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
                    <Link href={route('purchase.suppliers.edit', supplier.id)}>{t('common.edit')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    {t('common.delete')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
