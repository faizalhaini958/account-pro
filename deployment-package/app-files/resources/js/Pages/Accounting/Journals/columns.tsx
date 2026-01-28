"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { ArrowUpDown, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { format } from "date-fns"
import { Link } from "@inertiajs/react"
import { Checkbox } from "@/Components/ui/checkbox"

export type JournalEntry = {
    id: number
    date: string
    entry_number: string
    description: string
    reference_number: string | null
    status: string
    lines: {
        amount: string
        type: 'debit' | 'credit'
    }[]
}

export const columns: ColumnDef<JournalEntry>[] = [
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
        cell: ({ row }) => {
            const date = new Date(row.getValue("date"))
            return <div>{format(date, "dd/MM/yyyy")}</div>
        },
    },

    {
        accessorKey: "reference_number",
        header: "Reference",
        cell: ({ row }) => <div className="text-xs text-muted-foreground">{row.getValue("reference_number") || "-"}</div>
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => <div className="max-w-[300px] truncate">{row.getValue("description")}</div>
    },
    {
        accessorKey: "lines",
        id: "total_amount",
        header: ({ column }) => {
            return (
                <div className="text-right">
                    Total Amount
                </div>
            )
        },
        cell: ({ row }) => {
            const entry = row.original;
            const total = entry.lines
                .filter(l => l.type === 'debit')
                .reduce((sum, line) => sum + parseFloat(line.amount), 0);

            return <div className="text-right font-medium">{formatCurrency(total)}</div>
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <div className="text-center">Status</div>
        ),
        cell: ({ row }) => (
            <div className="text-center">
                <Badge variant="outline" className="capitalize">
                    {row.getValue("status")}
                </Badge>
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const entry = row.original

            return (
                <div className="text-right">
                    <Button size="sm" variant="ghost" asChild>
                        <Link href={route('accounting.journals.show', entry.id)}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            )
        },
    },
]
