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

export type Customer = {
    id: number
    name: string
    code: string
    email: string
    phone: string
    is_active: boolean
    created_at: string
}

export const columns: ColumnDef<Customer>[] = [
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
        accessorKey: "code",
        header: () => {
            const { t } = useTranslation()
            return t('customers.code')
        },
        cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("code") || '-'}</div>
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            const { t } = useTranslation()
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t('customers.name')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "email",
        header: () => {
            const { t } = useTranslation()
            return t('customers.email')
        },
    },
    {
        accessorKey: "phone",
        header: () => {
            const { t } = useTranslation()
            return t('customers.phone')
        },
    },
    {
        accessorKey: "is_active",
        header: () => {
            const { t } = useTranslation()
            return t('master.status')
        },
        cell: ({ row }) => {
            const { t } = useTranslation()
            const isActive = row.getValue("is_active")
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? t('master.isActive') : t('master.inactive')}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const customer = row.original

            return <ActionCell customer={customer} />
        },
    },
]

const ActionCell = ({ customer }: { customer: Customer }) => {
    const { delete: destroy } = useInertiaForm({})
    const { t } = useTranslation()

    const handleDelete = () => {
        if (confirm(t('customers.deleteConfirm'))) {
            destroy(route("master.customers.destroy", customer.id))
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
                <DropdownMenuItem asChild>
                    <Link href={route('master.customers.edit', customer.id)}>{t('master.edit')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    {t('master.delete')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
