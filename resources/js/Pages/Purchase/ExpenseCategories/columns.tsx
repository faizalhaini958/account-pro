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

export type ExpenseCategory = {
    id: number
    name: string
    description?: string
    account?: {
        name: string
        code: string
    }
    is_active: boolean
}

export const getColumns = (t: any): ColumnDef<ExpenseCategory>[] => [

    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Category Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const category = row.original
            return (
                <div>
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                        <div className="text-sm text-gray-500 truncate max-w-[300px]">{category.description}</div>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "account.name",
        header: () => {
            return "Linked Account"
        },
        cell: ({ row }) => {
            const account = row.original.account
            return account ? (
                <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="font-mono text-xs">{account.code}</Badge>
                    <span>{account.name}</span>
                </div>
            ) : <span className="text-muted-foreground italic">Not Linked</span>
        },
    },
    {
        accessorKey: "is_active",
        header: () => {
            return "Status"
        },
        cell: ({ row }) => {
            return row.original.is_active ?
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge> :
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>
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

const ActionCell = ({ category }: { category: ExpenseCategory }) => {
    const { delete: destroy } = useInertiaForm({})
    const { t } = useTranslation()

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this category?")) {
            destroy(route("purchase.expense-categories.destroy", category.id))
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
                    <Link href={route('purchase.expense-categories.edit', category.id)}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
