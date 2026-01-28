import { useState } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, useForm, Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Button } from "@/Components/ui/button"
import { Card, CardContent } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
import { Textarea } from "@/Components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/Components/ui/form"
import { useFieldArray, useForm as useReactHookForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Trash2, Plus } from "lucide-react"
import { formatCurrency } from "@/lib/format"

const creditNoteSchema = z.object({
    customer_id: z.string().min(1, "Customer is required"),
    date: z.string().min(1, "Date is required"),
    invoice_id: z.string().optional().nullable(),
    reason: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    items: z.array(z.object({
        product_id: z.string().min(1, "Product is required"),
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(0.01, "Quantity must be greater than 0"),
        unit_price: z.number().min(0, "Price must be positive"),
        discount_amount: z.number().optional().nullable(),
        tax_percent: z.number().optional().nullable(),
    })).min(1, "At least one item is required"),
})

type CreditNoteFormValues = z.infer<typeof creditNoteSchema>

interface Props {
    creditNote: any
    customers: any[]
    products: any[]
}

export default function Edit({ creditNote, customers, products }: Props) {
    const { t } = useTranslation()
    const isDraft = creditNote.status === 'draft'

    const form = useReactHookForm<CreditNoteFormValues>({
        resolver: zodResolver(creditNoteSchema) as any,
        defaultValues: {
            customer_id: creditNote.customer_id.toString(),
            date: creditNote.date,
            invoice_id: creditNote.invoice_id?.toString() || "",
            reason: creditNote.reason,
            notes: creditNote.notes,
            items: creditNote.items.map((item: any) => ({
                product_id: item.product_id?.toString() || "",
                description: item.description,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                discount_amount: Number(item.discount_amount),
                tax_percent: Number(item.tax_percent),
            })),
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    const watchItems = form.watch("items")

    const calculateTotals = () => {
        return watchItems.reduce((acc, item) => {
            const qty = Number(item.quantity) || 0
            const price = Number(item.unit_price) || 0
            const discount = Number(item.discount_amount) || 0
            const taxPct = Number(item.tax_percent) || 0

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

    const total = calculateTotals()

    const onSubmit = (values: CreditNoteFormValues) => {
        import('@inertiajs/react').then(({ router }) => {
            router.put(route('sales.credit-notes.update', creditNote.id), values as any)
        })
    }

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find(p => p.id.toString() === productId)
        if (product) {
            form.setValue(`items.${index}.product_id`, productId)
            form.setValue(`items.${index}.description`, product.name)
            form.setValue(`items.${index}.unit_price`, parseFloat(product.retail_price))
        }
    }

    return (
        <DashboardLayout header={`Edit Credit Note: ${creditNote.number}`}>
            <Head title={`Edit Credit Note: ${creditNote.number}`} />

            <div className="max-w-5xl mx-auto py-6">
                {!isDraft && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                        {t('creditNotes.readOnly', { status: creditNote.status })}
                    </div>
                )}

                <Form {...form}>
                    <fieldset disabled={!isDraft} className="space-y-8">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <Card>
                                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="customer_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Customer</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Customer" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {customers.map((customer) => (
                                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                                {customer.name} {customer.company_name ? `(${customer.company_name})` : ''}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="invoice_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Reference Invoice</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} value={field.value || ''} placeholder="Invoice ID" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="reason"
                                        render={({ field }) => (
                                            <FormItem className="col-span-1 md:col-span-2">
                                                <FormLabel>Reason</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} value={field.value || ''} placeholder="Reason for credit note..." />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium">Items</h3>
                                        {isDraft && (
                                            <Button type="button" variant="outline" size="sm" onClick={() => append({ product_id: "", description: "", quantity: 1, unit_price: 0, discount_amount: 0, tax_percent: 0 })}>
                                                <Plus className="mr-2 h-4 w-4" /> Add Item
                                            </Button>
                                        )}
                                    </div>

                                    {fields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-12 gap-4 items-end border p-4 rounded-lg bg-gray-50/50">
                                            <div className="col-span-12 md:col-span-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.product_id`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Label>Product</Label>
                                                            <Select onValueChange={(val) => handleProductChange(index, val)} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select Product" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {products.map((product) => (
                                                                        <SelectItem key={product.id} value={product.id.toString()}>
                                                                            {product.sku} - {product.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-12 md:col-span-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.description`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Label>Description</Label>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-6 md:col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Label>Qty</Label>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-6 md:col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.unit_price`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Label>Price</Label>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="col-span-12 flex justify-end">
                                                {isDraft && (
                                                    <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => remove(index)}>
                                                        <Trash2 className="h-4 w-4 mr-2" /> Remove
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex justify-end pt-4 border-t">
                                        <div className="w-64 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Subtotal:</span>
                                                <span>{formatCurrency(total.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tax:</span>
                                                <span>{formatCurrency(total.tax)}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Amount:</span>
                                                <span>{formatCurrency(total.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end space-x-4">
                                <Button variant="outline" asChild>
                                    <Link href={route('sales.credit-notes.index')}>Back</Link>
                                </Button>
                                {isDraft && <Button type="submit" disabled={form.formState.isSubmitting}>Save Changes</Button>}
                            </div>
                        </form>
                    </fieldset>
                </Form>
            </div>
        </DashboardLayout>
    )
}
