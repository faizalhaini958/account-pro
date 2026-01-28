import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, router } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Plus, Trash2 } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { formatCurrency } from "@/lib/format"
import { useEffect, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"
import { Calendar } from "@/Components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const invoiceSchema = z.object({
    customer_id: z.string().min(1, "Customer is required"),
    date: z.date(),
    due_date: z.date(),
    reference_number: z.string().optional(),
    notes: z.string().optional().nullable(), // Allow nullable for existing null notes
    items: z.array(z.object({
        product_id: z.string().optional().nullable(),
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(0.01, "Quantity must be greater than 0"),
        unit_price: z.number().min(0, "Price must be positive"),
        tax_percent: z.number().min(0).optional().nullable(),
    })).min(1, "At least one item is required"),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

interface Props {
    invoice: any
    customers: Array<{ id: number, name: string }>
    products: Array<{ id: number, name: string, retail_price: number }>
}

export default function Edit({ invoice, customers, products }: Props) {
    const { t } = useTranslation()
    const [processing, setProcessing] = useState(false)

    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            customer_id: invoice.customer_id.toString(),
            date: new Date(invoice.date),
            due_date: new Date(invoice.due_date),
            reference_number: invoice.reference_number,
            notes: invoice.notes,
            items: invoice.items.map((item: any) => ({
                product_id: item.product_id?.toString(),
                description: item.description,
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unit_price),
                tax_percent: parseFloat(item.tax_percent),
            }))
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    })

    const watchItems = form.watch("items")

    const calculateTotals = () => {
        let subtotal = 0
        let tax = 0

        watchItems.forEach(item => {
            const lineTotal = (item.quantity || 0) * (item.unit_price || 0)
            const lineTax = lineTotal * ((item.tax_percent || 0) / 100)
            subtotal += lineTotal
            tax += lineTax
        })

        return { subtotal, tax, total: subtotal + tax }
    }

    const { subtotal, tax, total } = calculateTotals()

    const onSubmit = (data: InvoiceFormValues) => {
        setProcessing(true)
        router.put(route('sales.invoices.update', invoice.id), {
            ...data,
            date: format(data.date, "yyyy-MM-dd"), // Format date for Laravel
            due_date: format(data.due_date, "yyyy-MM-dd"),
        } as any, {
            onFinish: () => setProcessing(false)
        })
    }

    const handleProductSelect = (index: number, productId: string) => {
        const product = products.find(p => p.id.toString() === productId)
        if (product) {
            form.setValue(`items.${index}.description`, product.name)
            form.setValue(`items.${index}.unit_price`, parseFloat(product.retail_price.toString()))
            form.setValue(`items.${index}.product_id`, productId)
        }
    }

    return (
        <DashboardLayout header={`Edit Invoice: ${invoice.reference_number}`}>
            <Head title={`Edit Invoice: ${invoice.reference_number}`} />

            <div className="max-w-5xl mx-auto py-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Header Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Customer *</Label>
                                <Select
                                    value={form.watch("customer_id")}
                                    onValueChange={(val) => form.setValue("customer_id", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(customer => (
                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.customer_id && (
                                    <p className="text-sm text-red-500">{form.formState.errors.customer_id.message}</p>
                                )}
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <Label>Date *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !form.watch("date") && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {form.watch("date") ? format(form.watch("date"), "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={form.watch("date")}
                                            onSelect={(date) => date && form.setValue("date", date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <Label>Due Date *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !form.watch("due_date") && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {form.watch("due_date") ? format(form.watch("due_date"), "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={form.watch("due_date")}
                                            onSelect={(date) => date && form.setValue("due_date", date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>Reference</Label>
                                <Input {...form.register("reference_number")} placeholder="Auto-generated if empty" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[30%]">Product / Description</TableHead>
                                        <TableHead className="w-[15%]">Qty</TableHead>
                                        <TableHead className="w-[20%]">Price</TableHead>
                                        <TableHead className="w-[15%]">Tax %</TableHead>
                                        <TableHead className="w-[15%] text-right">Amount</TableHead>
                                        <TableHead className="w-[5%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell className="space-y-2">
                                                <Select
                                                    value={form.watch(`items.${index}.product_id`) || undefined}
                                                    onValueChange={(val) => handleProductSelect(index, val)}
                                                >
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue placeholder="Select Product" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products.map(product => (
                                                            <SelectItem key={product.id} value={product.id.toString()}>
                                                                {product.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    {...form.register(`items.${index}.description` as const)}
                                                    placeholder="Description"
                                                />
                                                {form.formState.errors.items?.[index]?.description && (
                                                    <p className="text-xs text-red-500">{form.formState.errors.items[index]?.description?.message}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...form.register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...form.register(`items.${index}.unit_price` as const, { valueAsNumber: true })}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...form.register(`items.${index}.tax_percent` as const, { valueAsNumber: true })}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(
                                                    (watchItems[index]?.quantity || 0) * (watchItems[index]?.unit_price || 0)
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => append({ description: "", quantity: 1, unit_price: 0, tax_percent: 0, product_id: null })}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Create
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Footer Totals & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea {...form.register("notes")} placeholder="Terms & Conditions, Payment details..." />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>{formatCurrency(tax)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                                    <span>Amount</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button variant="outline" asChild>
                            <Link href={route('sales.invoices.index')}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>Save Changes</Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    )
}
