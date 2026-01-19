import { Link, useForm as useInertiaForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/Components/ui/badge"
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

export type Category = {
    id: number
    name: string
    description: string | null
    parent: { id: number; name: string } | null
    is_active: boolean
}

export const columns: ColumnDef<Category>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            const { t } = useTranslation()
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t('categories.name')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "description",
        header: () => {
            const { t } = useTranslation()
            return t('categories.description')
        },
        cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("description") || '-'}</span>
    },
    {
        accessorKey: "parent",
        header: () => {
            const { t } = useTranslation()
            return t('categories.parent')
        },
        cell: ({ row }) => {
            const parent = row.getValue("parent") as Category["parent"]
            return parent ? <span>{parent.name}</span> : <span className="text-muted-foreground">-</span>
        }
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
            const category = row.original

            return <ActionCell category={category} />
        },
    },
]

const ActionCell = ({ category }: { category: Category }) => {
    const { delete: destroy } = useInertiaForm({})
    const { t } = useTranslation()

    const handleDelete = () => {
        if (confirm(t('categories.deleteConfirm'))) {
            destroy(route("master.categories.destroy", category.id))
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
                    <Link href={route('master.categories.edit', category.id)}>{t('master.edit')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    {t('master.delete')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
