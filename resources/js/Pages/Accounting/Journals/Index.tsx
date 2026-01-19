import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, useForm } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Plus, Loader2, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { columns } from "./columns"
import { DataTable } from "@/Components/ui/data-table"

interface JournalLine {
    id: number
    type: 'debit' | 'credit'
    amount: string
    account: {
        id: number
        name: string
        code: string
    }
}

interface JournalEntry {
    id: number
    date: string
    entry_number: string
    description: string
    reference_number: string | null
    status: string
    lines: JournalLine[]
    total_amount: number
}

interface Props {
    entries: {
        data: JournalEntry[]
        links: any[]
    }
    accounts: any[]
}

interface LineItem {
    account_id: string
    description: string
    debit: number
    credit: number
}

export default function Index({ entries, accounts }: Props) {
    const [open, setOpen] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({
        date: new Date().toISOString().split('T')[0],
        description: "",
        reference_number: "",
        lines: [
            { account_id: "", description: "", debit: 0, credit: 0 },
            { account_id: "", description: "", debit: 0, credit: 0 },
        ] as LineItem[],
    })

    const [totals, setTotals] = useState({ debit: 0, credit: 0, diff: 0 })

    useEffect(() => {
        const totalDebit = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0)
        const totalCredit = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0)
        setTotals({
            debit: totalDebit,
            credit: totalCredit,
            diff: totalDebit - totalCredit
        })
    }, [data.lines])

    const handleLineChange = (index: number, field: keyof LineItem, value: any) => {
        const newLines = [...data.lines]
        newLines[index] = { ...newLines[index], [field]: value }

        if (field === 'debit' && value > 0) newLines[index].credit = 0
        if (field === 'credit' && value > 0) newLines[index].debit = 0

        setData("lines", newLines)
    }

    const addLine = () => {
        setData("lines", [...data.lines, { account_id: "", description: "", debit: 0, credit: 0 }])
    }

    const removeLine = (index: number) => {
        if (data.lines.length <= 2) return
        const newLines = data.lines.filter((_, i) => i !== index)
        setData("lines", newLines)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (Math.abs(totals.diff) > 0.01) {
            alert("Journal must balance (Difference must be 0) before posting.")
            return
        }
        post(route('accounting.journals.store'), {
            onSuccess: () => {
                setOpen(false)
                reset()
                setData("lines", [
                    { account_id: "", description: "", debit: 0, credit: 0 },
                    { account_id: "", description: "", debit: 0, credit: 0 },
                ])
            },
        })
    }

    return (
        <DashboardLayout header="Journal Entries">
            <Head title="Journal Entries" />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Journal Entries</h2>
                        <p className="text-muted-foreground">Manage manual and system-generated journal entries.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> New Journal Entry
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>New Journal Entry</DialogTitle>
                                    <DialogDescription>
                                        Create a manual journal entry. Debits must equal Credits.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Date *</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={data.date}
                                                onChange={e => setData("date", e.target.value)}
                                                required
                                            />
                                            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="reference">Reference #</Label>
                                            <Input
                                                id="reference"
                                                value={data.reference_number}
                                                onChange={e => setData("reference_number", e.target.value)}
                                                placeholder="e.g. ADJ-001"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Input
                                                id="description"
                                                value={data.description}
                                                onChange={e => setData("description", e.target.value)}
                                                placeholder="Brief description"
                                            />
                                        </div>
                                    </div>

                                    <div className="border rounded-md p-4 space-y-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[30%]">Account</TableHead>
                                                    <TableHead className="w-[30%]">Description</TableHead>
                                                    <TableHead className="w-[15%] text-right">Debit</TableHead>
                                                    <TableHead className="w-[15%] text-right">Credit</TableHead>
                                                    <TableHead className="w-[5%]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.lines.map((line, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Select
                                                                value={line.account_id}
                                                                onValueChange={val => handleLineChange(index, 'account_id', val)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Account" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {accounts?.map(acc => (
                                                                        <SelectItem key={acc.id} value={acc.id.toString()}>
                                                                            {acc.code} - {acc.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={line.description}
                                                                onChange={e => handleLineChange(index, 'description', e.target.value)}
                                                                placeholder="Line description"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={line.debit}
                                                                onChange={e => handleLineChange(index, 'debit', parseFloat(e.target.value) || 0)}
                                                                className="text-right"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={line.credit}
                                                                onChange={e => handleLineChange(index, 'credit', parseFloat(e.target.value) || 0)}
                                                                className="text-right"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            {data.lines.length > 2 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeLine(index)}
                                                                    className="text-red-500"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <Button type="button" variant="outline" size="sm" onClick={addLine}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Line
                                        </Button>

                                        <div className="flex justify-end gap-8 pt-4 border-t text-sm font-medium">
                                            <div className="text-right">
                                                <div className="text-muted-foreground">Total Debit</div>
                                                <div className="text-xl">{formatCurrency(totals.debit)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-muted-foreground">Total Credit</div>
                                                <div className="text-xl">{formatCurrency(totals.credit)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-muted-foreground">Difference</div>
                                                <div className={`text-xl ${Math.abs(totals.diff) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {formatCurrency(Math.abs(totals.diff))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {errors.lines && <p className="text-sm text-red-500 text-right">{errors.lines}</p>}

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing || Math.abs(totals.diff) > 0.01}>
                                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Post Journal Entry
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                    <DataTable
                        columns={columns}
                        data={entries.data}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
