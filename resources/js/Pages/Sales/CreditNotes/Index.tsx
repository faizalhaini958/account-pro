import DashboardLayout from "@/Layouts/DashboardLayout"
import axios from "axios"
import { Head, Link, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { DataTable } from "@/Components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/Components/ui/button"
import { Plus, CalendarIcon, Loader2, Trash2, Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
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
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"
import { Calendar } from "@/Components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { formatCurrency } from "@/lib/format"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/Components/ui/command"

interface IndexProps {
    creditNotes: any
    customers: Array<{ id: number, name: string, company_name?: string }>
    products: Array<{ id: number, name: string, sku: string, retail_price: string }>
    invoices: Array<{ id: number, number: string, date: string, total: number, outstanding_amount: number, customer_id: number }>
}

interface CreditNoteItem {
    product_id: string
    description: string
    quantity: number
    unit_price: number
    tax_percent: number
    discount_amount: number
}

export default function Index({ creditNotes, customers, products, invoices = [] }: IndexProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [invoiceOpen, setInvoiceOpen] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: "",
        invoice_id: "",
        date: new Date(),
        reason: "",
        notes: "",
        items: [
            { product_id: "", description: "", quantity: 1, unit_price: 0, tax_percent: 0, discount_amount: 0 }
        ] as CreditNoteItem[]
    })

    const filteredInvoices = invoices.filter(invoice =>
        data.customer_id ? invoice.customer_id.toString() === data.customer_id : false
    )

    const handleAddItem = () => {
        setData("items", [
            ...data.items,
            { product_id: "", description: "", quantity: 1, unit_price: 0, tax_percent: 0, discount_amount: 0 }
        ])
    }

    const handleRemoveItem = (index: number) => {
        if (data.items.length <= 1) return
        const newItems = data.items.filter((_, i) => i !== index)
        setData("items", newItems)
    }

    const handleItemChange = (index: number, field: keyof CreditNoteItem, value: any) => {
        const newItems = [...data.items]

        if (field === 'product_id') {
            const product = products.find(p => p.id.toString() === value)
            if (product) {
                newItems[index] = {
                    ...newItems[index],
                    product_id: value,
                    description: product.name,
                    unit_price: parseFloat(product.retail_price) || 0
                }
            } else {
                newItems[index] = { ...newItems[index], [field]: value }
            }
        } else {
            newItems[index] = { ...newItems[index], [field]: value }
        }

        setData("items", newItems)
    }

    const calculateTotals = () => {
        return data.items.reduce((acc, item) => {
            const qty = item.quantity || 0
            const price = item.unit_price || 0
            const discount = item.discount_amount || 0
            const taxPct = item.tax_percent || 0

            const subtotal = (qty * price) - discount
            const tax = subtotal * (taxPct / 100)
            const total = subtotal + tax

            return {
                subtotal: acc.subtotal + (qty * price),
                discount: acc.discount + discount,
                tax: acc.tax + tax,
                total: acc.total + total
            }
        }, { subtotal: 0, discount: 0, tax: 0, total: 0 })
    }

    const totals = calculateTotals()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('sales.credit-notes.store'), {
            onSuccess: () => {
                setOpen(false)
                reset()
            },
        })
    }

    return (
        <DashboardLayout header="Credit Notes">
            <Head title="Credit Notes" />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Credit Notes</h2>
                    <div className="flex items-center space-x-2">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Credit Note
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create New Credit Note</DialogTitle>
                                    <DialogDescription>
                                        Create a new credit note for a customer.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="col-span-1 lg:col-span-2 space-y-2">
                                            <Label htmlFor="customer_id">Customer</Label>
                                            <Select
                                                value={data.customer_id}
                                                onValueChange={(val) => {
                                                    setData({ ...data, customer_id: val, invoice_id: "" })
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Customer" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {customers?.map((customer) => (
                                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                                            {customer.name} {customer.company_name ? `(${customer.company_name})` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.customer_id && <p className="text-sm text-red-500">{errors.customer_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="invoice_id">Reference Invoice</Label>
                                            <Popover open={invoiceOpen} onOpenChange={setInvoiceOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={invoiceOpen}
                                                        className="w-full justify-between"
                                                        disabled={!data.customer_id}
                                                    >
                                                        {data.invoice_id
                                                            ? filteredInvoices.find((invoice) => invoice.id.toString() === data.invoice_id)?.number
                                                            : (data.customer_id ? "Select Invoice..." : "Select Customer First")}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search invoice..." />
                                                        <CommandList>
                                                            <CommandEmpty>No invoice found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {filteredInvoices.map((invoice) => (
                                                                    <CommandItem
                                                                        key={invoice.id}
                                                                        value={invoice.number}
                                                                        onSelect={async () => {
                                                                            setInvoiceOpen(false)
                                                                            // Set ID first
                                                                            setData(currentData => ({ ...currentData, invoice_id: invoice.id.toString() }))

                                                                            // Fetch items
                                                                            try {
                                                                                const response = await axios.get(route('sales.invoices.items', invoice.id))
                                                                                const invoiceItems = response.data.items.map((item: any) => ({
                                                                                    product_id: item.product_id?.toString() || "",
                                                                                    description: item.description,
                                                                                    quantity: Number(item.quantity),
                                                                                    unit_price: Number(item.unit_price),
                                                                                    tax_percent: Number(item.tax_percent),
                                                                                    discount_amount: 0 // Invoices don't usually store line discount amount same way, default 0
                                                                                }))

                                                                                if (invoiceItems.length > 0) {
                                                                                    setData(currentData => ({
                                                                                        ...currentData,
                                                                                        invoice_id: invoice.id.toString(),
                                                                                        items: invoiceItems
                                                                                    }))
                                                                                }
                                                                            } catch (error) {
                                                                                console.error("Failed to fetch invoice items", error)
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                data.invoice_id === invoice.id.toString() ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {invoice.number} ({formatCurrency(invoice.total)})
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            {errors.invoice_id && <p className="text-sm text-red-500">{errors.invoice_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !data.date && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {data.date ? (
                                                            format(data.date, "dd/MM/yyyy")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={data.date}
                                                        onSelect={(date) => date && setData("date", date)}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reason">Reason</Label>
                                        <Textarea
                                            id="reason"
                                            value={data.reason}
                                            onChange={(e) => setData("reason", e.target.value)}
                                            placeholder="Reason for credit note..."
                                        />
                                    </div>

                                    {/* Items Table */}
                                    <div className="border rounded-md p-4 bg-muted/20">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium">Items</h3>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[20%]">Product</TableHead>
                                                    <TableHead className="w-[25%]">Description</TableHead>
                                                    <TableHead className="w-[10%]">Qty</TableHead>
                                                    <TableHead className="w-[15%]">Price</TableHead>
                                                    <TableHead className="w-[10%]">Disc.</TableHead>
                                                    <TableHead className="w-[10%]">Tax %</TableHead>
                                                    <TableHead className="w-[10%]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.items.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Select
                                                                value={item.product_id}
                                                                onValueChange={(val) => handleItemChange(index, "product_id", val)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Product" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {products?.map((p) => (
                                                                        <SelectItem key={p.id} value={p.id.toString()}>
                                                                            {p.sku}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={item.description}
                                                                onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="1"
                                                                value={item.quantity}
                                                                onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.unit_price}
                                                                onChange={(e) => handleItemChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.discount_amount}
                                                                onChange={(e) => handleItemChange(index, "discount_amount", parseFloat(e.target.value) || 0)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="1"
                                                                value={item.tax_percent}
                                                                onChange={(e) => handleItemChange(index, "tax_percent", parseFloat(e.target.value) || 0)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveItem(index)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <div className="mt-4 flex justify-between">
                                            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                                <Plus className="mr-2 h-4 w-4" /> Add Item
                                            </Button>

                                            <div className="w-64 space-y-2 text-right text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Subtotal:</span>
                                                    <span>{formatCurrency(totals.subtotal)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Discount:</span>
                                                    <span>{formatCurrency(totals.discount)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Tax:</span>
                                                    <span>{formatCurrency(totals.tax)}</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                                    <span>Total:</span>
                                                    <span>{formatCurrency(totals.total)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData("notes", e.target.value)}
                                            placeholder="Notes..."
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Create Credit Note
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
                        data={creditNotes.data}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
