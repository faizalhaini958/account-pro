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

export type DeliveryOrder = {
    id: string
    number: string
    date: string
    customer: {
        id: number
        name: string
        company_name?: string
    }
    status: 'draft' | 'sent' | 'delivered' | 'returned'
    created_at: string
}

export const columns: ColumnDef<DeliveryOrder>[] = [
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
                    Invoice No.
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
            return "Date"
        },
        cell: ({ row }) => {
            return <div>{format(new Date(row.getValue("date")), "dd MMM yyyy")}</div>
        },
    },
    {
        accessorKey: "customer.name",
        header: () => {
            const { t } = useTranslation()
            return "Customer"
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
        accessorKey: "status",
        header: () => {
            const { t } = useTranslation()
            return "Status"
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={
                    status === 'draft' ? 'outline' :
                        status === 'sent' ? 'secondary' :
                            status === 'delivered' ? 'default' :
                                status === 'returned' ? 'destructive' :
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
            const deliveryOrder = row.original

            return <ActionCell deliveryOrder={deliveryOrder} />
        },
    },
]

const ActionCell = ({ deliveryOrder }: { deliveryOrder: DeliveryOrder }) => {
    const { t } = useTranslation()
    const { delete: destroy } = useInertiaForm({})

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this delivery order?")) {
            destroy(route("sales.delivery-orders.destroy", deliveryOrder.id))
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
                    onClick={() => navigator.clipboard.writeText(deliveryOrder.number)}
                >
                    Copy Number
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a href={route('sales.delivery-orders.pdf', deliveryOrder.id)} target="_blank">
                        Download PDF
                    </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {deliveryOrder.status === 'draft' && (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href={route('sales.delivery-orders.edit', deliveryOrder.id)}>Edit</Link>
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
