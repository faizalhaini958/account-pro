import { Link, useForm as useInertiaForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/Components/ui/badge"
import { Checkbox } from "@/Components/ui/checkbox"
import { Button } from "@/Components/ui/button"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"

export type Product = {
    id: number
    name: string
    sku: string
    type: 'product' | 'service'
    retail_price: number
    purchase_cost: number
    current_stock: number
    is_active: boolean
}

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            const { t } = useTranslation()
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t('products.name')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "sku",
        header: () => {
            const { t } = useTranslation()
            return t('products.sku')
        },
        cell: ({ row }) => <span className="font-mono">{row.getValue("sku") || '-'}</span>
    },
    {
        accessorKey: "type",
        header: () => {
            const { t } = useTranslation()
            return t('products.type')
        },
        cell: ({ row }) => {
            const { t } = useTranslation()
            const type = row.getValue("type") as string
            return <span className="capitalize">{t(`products.type.${type}`)}</span>
        }
    },
    {
        accessorKey: "retail_price",
        header: ({ column }) => {
            const { t } = useTranslation()
            return <div className="text-right">{t('products.retailPrice')}</div>
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("retail_price"))
            return <div className="text-right font-medium">{formatCurrency(amount)}</div>
        },
    },
    {
        accessorKey: "current_stock",
        header: ({ column }) => {
            const { t } = useTranslation()
            return <div className="text-right">{t('products.currentStock')}</div>
        },
        cell: ({ row }) => {
            const stock = parseFloat(row.getValue("current_stock"))
            return <div className="text-right font-medium">{stock}</div>
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
            return (
                <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>
                    {row.getValue("is_active") ? t('master.isActive') : t('master.inactive')}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original

            return <ActionCell product={product} />
        },
    },
]

const ActionCell = ({ product }: { product: Product }) => {
    const { delete: destroy } = useInertiaForm({})
    const { t } = useTranslation()

    const handleDelete = () => {
        if (confirm(t('products.deleteConfirm'))) {
            destroy(route("master.products.destroy", product.id))
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
                    <Link href={route('master.products.edit', product.id)}>{t('master.edit')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    {t('master.delete')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
