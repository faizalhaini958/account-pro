import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/Components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"
import { Calendar } from "@/Components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { useForm as useReactHookForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { useEffect } from "react"
import { formatCurrency } from "@/lib/format"
import { useTranslation } from "react-i18next"

const itemSchema = z.object({
    product_id: z.string().optional().nullable(),
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(0.01),
    unit_price: z.number().min(0),
    tax_percent: z.number().min(0).optional().nullable(),
    track_inventory: z.boolean().default(false),
})

const invoiceSchema = z.object({
    supplier_id: z.string().min(1, "Supplier is required"),
    date: z.date(),
    due_date: z.date(),
    reference_number: z.string().min(1, "Reference number is required"),
    notes: z.string().optional().nullable(),
    terms: z.string().optional().nullable(),
    items: z.array(itemSchema).min(1, "At least one item is required"),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

interface Props {
    invoice: any
    suppliers: Array<{ id: number, name: string }>
    products: Array<{ id: number, name: string, price: string }>
}

export default function Edit({ invoice, suppliers, products }: Props) {
    const { t } = useTranslation()
    const form = useReactHookForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema) as any,
        defaultValues: {
            supplier_id: invoice.supplier_id.toString(),
            date: new Date(invoice.date),
            due_date: new Date(invoice.due_date),
            reference_number: invoice.reference_number,
            notes: invoice.notes || "",
            terms: invoice.terms || "",
            items: invoice.items.map((item: any) => ({
                product_id: item.product_id ? item.product_id.toString() : null,
                description: item.description,
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unit_price),
                tax_percent: parseFloat(item.tax_percent),
                track_inventory: Boolean(item.track_inventory),
            })),
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    const watchItems = form.watch("items")

    const calculateTotal = () => {
        return watchItems.reduce((acc, item) => {
            const qty = item.quantity || 0
            const price = item.unit_price || 0
            const tax = item.tax_percent || 0
            const lineTotal = qty * price
            const lineTax = lineTotal * (tax / 100)
            return acc + lineTotal + lineTax
        }, 0)
    }

    const onSubmit = (values: InvoiceFormValues) => {
        import('@inertiajs/react').then(({ router }) => {
            router.put(route('purchase.invoices.update', invoice.id), {
                ...values,
                supplier_id: parseInt(values.supplier_id),
                items: values.items.map(item => ({
                    ...item,
                    product_id: item.product_id ? parseInt(item.product_id) : null,
                }))
            } as any)
        })
    }

    if (invoice.status !== 'draft') {
        return (
            <DashboardLayout header={`${t('purchaseInvoices.view')}: ${invoice.reference_number}`}>
                <Head title={`${t('purchaseInvoices.view')} ${invoice.reference_number}`} />
                <div className="max-w-7xl mx-auto py-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('purchaseInvoices.status')}: {invoice.status.toUpperCase()}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{t('purchaseInvoices.readOnly', { status: invoice.status })}</p>
                            <div className="mt-4">
                                <Button variant="outline" asChild>
                                    <Link href={route('purchase.invoices.index')}>{t('purchaseInvoices.backToList')}</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout header={`${t('purchaseInvoices.edit')}: ${invoice.reference_number}`}>
            <Head title={`${t('purchaseInvoices.edit')} ${invoice.reference_number}`} />

            <div className="max-w-7xl mx-auto py-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        {/* Header Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('purchaseInvoices.details')}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <FormField
                                    control={form.control}
                                    name="supplier_id"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>{t('purchaseInvoices.supplier')}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('purchaseInvoices.selectSupplier')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {suppliers.map((supplier) => (
                                                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                            {supplier.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="reference_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('purchaseInvoices.reference')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder={t('purchaseInvoices.referencePlaceholder')} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-1">
                                    <FormLabel>{t('purchaseInvoices.dates')}</FormLabel>
                                    <div className="flex space-x-2">
                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "dd/MM/yyyy")
                                                                    ) : (
                                                                        <span>Pick a date</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="due_date"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "dd/MM/yyyy")
                                                                    ) : (
                                                                        <span>{t('purchaseInvoices.dueDate')}</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Items Table */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>{t('purchaseInvoices.items')}</CardTitle>
                                <Button type="button" size="sm" onClick={() => append({ description: "", quantity: 1, unit_price: 0, tax_percent: 0, track_inventory: false })}>
                                    <Plus className="h-4 w-4 mr-2" /> {t('common.create')}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[300px]">{t('products.description')}</TableHead>
                                            <TableHead className="w-[100px]">Qty</TableHead>
                                            <TableHead className="w-[150px]">{t('products.retailPrice')}</TableHead>
                                            <TableHead className="w-[100px]">{t('creditNotes.tax')}</TableHead>
                                            <TableHead className="text-right">{t('purchaseInvoices.grandTotal').replace(':', '')}</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.description`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input {...field} placeholder="Item description" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.quantity`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input type="number" step="1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.unit_price`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.tax_percent`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        step="1"
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        onChange={e => {
                                                                            const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                                                            field.onChange(val);
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {(() => {
                                                        const item = watchItems[index]
                                                        if (!item) return "0.00"
                                                        const qty = item.quantity || 0
                                                        const price = item.unit_price || 0
                                                        const tax = item.tax_percent || 0
                                                        const total = (qty * price) * (1 + (tax / 100))
                                                        return formatCurrency(total)
                                                    })()}
                                                </TableCell>
                                                <TableCell>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="mt-4 flex justify-end">
                                    <div className="w-1/3 space-y-2">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>{t('purchaseInvoices.grandTotal')}</span>
                                            <span>{formatCurrency(calculateTotal())}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('purchaseInvoices.notes')}</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" asChild>
                                <Link href={route('purchase.invoices.index')}>{t('common.cancel')}</Link>
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>{t('purchaseInvoices.update')}</Button>
                        </div>
                    </form>
                </Form>
            </div>
        </DashboardLayout>
    )
}
