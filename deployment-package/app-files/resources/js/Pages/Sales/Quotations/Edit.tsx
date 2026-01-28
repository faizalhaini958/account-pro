import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Head, Link, useForm as useInertiaForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import DashboardLayout from "@/Layouts/DashboardLayout"
import { Button } from "@/Components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/Components/ui/form"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table"
import { Input } from "@/Components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"
import { Calendar } from "@/Components/ui/calendar"
import { Textarea } from "@/Components/ui/textarea"
import { Card, CardContent } from "@/Components/ui/card"
import { cn } from "@/lib/utils"
import { CalendarIcon, Trash2, PlusCircle } from "lucide-react"
import { format } from "date-fns"

// Types
interface Customer {
    id: number
    name: string
    company_name: string | null
    email: string | null
}

interface Product {
    id: number
    name: string
    sku: string | null
    retail_price: string
    unit_id: number | null
}

interface QuotationItem {
    id: number
    product_id: number | null
    description: string
    quantity: number
    unit_price: number
    discount_amount: number
    tax_rate: number
}

interface Quotation {
    id: number
    number: string
    customer_id: number
    date: string
    valid_until: string | null
    notes: string | null
    terms: string | null
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted'
    subtotal: number
    total: number
    tenant_id: number
    items: QuotationItem[]
}

interface EditProps {
    quotation: Quotation
    customers: Customer[]
    products: Product[]
}

// Validation Schema
const quotationFormSchema = z.object({
    customer_id: z.string().min(1, "Please select a customer."),
    date: z.date(),
    valid_until: z.date().optional(),
    items: z.array(
        z.object({
            product_id: z.string().optional(),
            description: z.string().min(1, "Description is required"),
            quantity: z.number().min(1, "Quantity must be at least 1"),
            unit_price: z.number().min(0, "Price must be positive"),
            discount_amount: z.number().default(0),
            tax_rate: z.number().default(0),
        })
    ).min(1, "At least one item is required"),
    notes: z.string().optional(),
    terms: z.string().optional(),
})

type QuotationFormValues = z.infer<typeof quotationFormSchema>

export default function Edit({ quotation, customers, products }: EditProps) {
    const { t } = useTranslation()
    const { setData, post, processing } = useInertiaForm({
        customer_id: quotation.customer_id.toString(),
        date: new Date(quotation.date),
        valid_until: quotation.valid_until ? new Date(quotation.valid_until) : undefined,
        items: quotation.items.map(item => ({
            ...item,
            product_id: item.product_id?.toString() || ""
        })),
        notes: quotation.notes || "",
        terms: quotation.terms || "",
    })

    // React Hook Form
    const form = useForm<QuotationFormValues>({
        resolver: zodResolver(quotationFormSchema) as any,
        defaultValues: {
            customer_id: quotation.customer_id.toString(),
            date: new Date(quotation.date),
            valid_until: quotation.valid_until ? new Date(quotation.valid_until) : undefined,
            items: quotation.items.map(item => ({
                product_id: item.product_id?.toString() || "",
                description: item.description,
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price),
                discount_amount: Number(item.discount_amount),
                tax_rate: Number(item.tax_rate), // Adjusted to match schema tax_rate
            })),
            notes: quotation.notes || "",
            terms: quotation.terms || "",
        },
    })

    const { fields, append, remove } = useFieldArray({
        name: "items",
        control: form.control,
    })

    function onProductSelect(index: number, productId: string) {
        const product = products.find(p => p.id.toString() === productId)
        if (product) {
            form.setValue(`items.${index}.description`, product.name)
            form.setValue(`items.${index}.unit_price`, parseFloat(product.retail_price))
            form.setValue(`items.${index}.product_id`, productId)
        }
    }

    const watchedItems = form.watch("items")

    const calculateTotals = () => {
        let subtotal = 0
        let taxTotal = 0

        watchedItems?.forEach(item => {
            const qty = item.quantity || 0
            const price = item.unit_price || 0
            const discount = item.discount_amount || 0

            const lineTotal = (qty * price) - discount
            subtotal += lineTotal
        })

        return { subtotal, taxTotal, total: subtotal + taxTotal }
    }

    const { subtotal, total } = calculateTotals()

    function onSubmit(values: QuotationFormValues) {
        // Use Inertia router directly for PUT request
        import('@inertiajs/react').then(({ router }) => {
            router.put(route('sales.quotations.update', quotation.id), {
                ...values,
                valid_until: values.valid_until
            } as any)
        })
    }

    const isDraft = quotation.status === 'draft'
    const isAccepted = quotation.status === 'accepted'

    function onConvert() {
        if (confirm("Generate Invoice from this quotation?")) {
            import('@inertiajs/react').then(({ router }) => {
                router.post(route('sales.quotations.convert', quotation.id))
            })
        }
    }

    return (
        <DashboardLayout header={
            <div className="flex justify-between items-center">
                <span>{t('quotations.edit')}: {quotation.number}</span>
                {isAccepted && (
                    <Button onClick={onConvert} className="bg-purple-600 hover:bg-purple-700">
                        Convert to Invoice
                    </Button>
                )}
            </div>
        }>
            <Head title={`${t('quotations.edit')}: ${quotation.number}`} />

            <div className="max-w-5xl mx-auto py-6">
                {!isDraft && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                        This quotation is <strong>{quotation.status}</strong>. It cannot be edited.
                    </div>
                )}

                <Form {...form}>
                    <fieldset disabled={!isDraft} className="space-y-8">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* Header Section */}
                            <Card>
                                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="customer_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('sales.customer')}</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('user.selectCompany')} />
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
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>{t('sales.date')}</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP")
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
                                                                disabled={(date) =>
                                                                    date > new Date() || date < new Date("1900-01-01")
                                                                }
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
                                            name="valid_until"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>{t('quotations.validUntil')}</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP")
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
                                                                selected={field.value || undefined}
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
                                </CardContent>
                            </Card>

                            {/* Line Items Table */}
                            <div className="rounded-md border bg-card">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[300px]">{t('products.name')}</TableHead>
                                            <TableHead className="w-[100px]">Quantity</TableHead>
                                            <TableHead className="w-[150px]">{t('products.retailPrice')}</TableHead>
                                            <TableHead className="w-[150px] text-right">{t('sales.amount')}</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell>
                                                    <div className="space-y-2">
                                                        <Select
                                                            onValueChange={(value) => onProductSelect(index, value)}
                                                            defaultValue={form.getValues(`items.${index}.product_id`) || undefined}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={t('common.search')} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {products.map((p) => (
                                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                                        {p.sku ? `[${p.sku}] ` : ''}{p.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Input
                                                            {...form.register(`items.${index}.description` as const)}
                                                            placeholder="Description"
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...form.register(`items.${index}.unit_price`, { valueAsNumber: true })}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {(
                                                        (watchedItems[index]?.quantity || 0) *
                                                        (watchedItems[index]?.unit_price || 0)
                                                    ).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => remove(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="p-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({
                                            product_id: "",
                                            description: "",
                                            quantity: 1,
                                            unit_price: 0,
                                            discount_amount: 0,
                                            tax_rate: 0
                                        })}
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Item
                                    </Button>
                                </div>
                            </div>

                            {/* Totals Section */}
                            <div className="flex justify-end">
                                <div className="w-1/3 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>MYR {subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>{t('sales.amount')}</span>
                                        <span>MYR {total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Notes */}
                            <Card>
                                <CardContent className="pt-6 grid gap-6">
                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Notes</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Notes" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="terms"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Terms & Conditions</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Payment terms, delivery info..." />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <div className="flex justify-end space-x-4">
                                <Button variant="outline" asChild>
                                    <Link href={route('sales.quotations.index')}>{t('common.back')}</Link>
                                </Button>
                                {isDraft && <Button type="submit" disabled={processing}>{t('common.saveChanges')}</Button>}
                            </div>
                        </form>
                    </fieldset>
                </Form>
            </div>
        </DashboardLayout >
    )
}
