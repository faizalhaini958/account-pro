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

const deliveryOrderSchema = z.object({
    customer_id: z.string().min(1, "Customer is required"),
    date: z.string().min(1, "Date is required"),
    delivered_at: z.string().optional().nullable(),
    delivery_address: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    items: z.array(z.object({
        product_id: z.string().min(1, "Product is required"),
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
    })).min(1, "At least one item is required"),
})

type DeliveryOrderFormValues = z.infer<typeof deliveryOrderSchema>

interface DeliveryOrderItem {
    id?: number
    product_id: number
    description: string
    quantity: number
}

interface DeliveryOrder {
    id: number
    number: string
    customer_id: number
    date: string
    delivered_at: string | null
    delivery_address: string | null
    notes: string | null
    status: 'draft' | 'sent' | 'delivered' | 'returned'
    items: DeliveryOrderItem[]
}

interface Props {
    deliveryOrder: DeliveryOrder
    customers: any[]
    products: any[]
}

export default function Edit({ deliveryOrder, customers, products }: Props) {
    const { t } = useTranslation()
    const isDraft = deliveryOrder.status === 'draft'

    const form = useReactHookForm<DeliveryOrderFormValues>({
        resolver: zodResolver(deliveryOrderSchema) as any,
        defaultValues: {
            customer_id: deliveryOrder.customer_id.toString(),
            date: deliveryOrder.date,
            delivered_at: deliveryOrder.delivered_at,
            delivery_address: deliveryOrder.delivery_address,
            notes: deliveryOrder.notes,
            items: deliveryOrder.items.map(item => ({
                product_id: item.product_id.toString(),
                description: item.description,
                quantity: Number(item.quantity)
            })),
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    const onSubmit = (values: DeliveryOrderFormValues) => {
        import('@inertiajs/react').then(({ router }) => {
            router.put(route('sales.delivery-orders.update', deliveryOrder.id), values as any)
        })
    }

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find(p => p.id.toString() === productId)
        if (product) {
            form.setValue(`items.${index}.product_id`, productId)
            form.setValue(`items.${index}.description`, product.name)
        }
    }

    return (
        <DashboardLayout header={`Edit Delivery Order: ${deliveryOrder.number}`}>
            <Head title={`Edit Delivery Order: ${deliveryOrder.number}`} />

            <div className="max-w-5xl mx-auto py-6">
                {!isDraft && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                        This delivery order is {deliveryOrder.status} and cannot be edited.
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
                                            name="delivered_at"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Delivery Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="delivery_address"
                                        render={({ field }) => (
                                            <FormItem className="col-span-1 md:col-span-2">
                                                <FormLabel>Delivery Address</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Enter delivery address..." value={field.value || ''} />
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
                                            <Button type="button" variant="outline" size="sm" onClick={() => append({ product_id: "", description: "", quantity: 1 })}>
                                                <Plus className="mr-2 h-4 w-4" /> Add Item
                                            </Button>
                                        )}
                                    </div>

                                    {fields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-12 gap-4 items-end border p-4 rounded-lg bg-gray-50/50">
                                            <div className="col-span-4">
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
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-5">
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.description`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Label>Description</Label>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-2">
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
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                {isDraft && (
                                                    <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => remove(index)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <div className="flex justify-end space-x-4">
                                <Button variant="outline" asChild>
                                    <Link href={route('sales.delivery-orders.index')}>Back</Link>
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
