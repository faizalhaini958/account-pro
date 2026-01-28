import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/Components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"
import { Calendar } from "@/Components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm as useReactHookForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTranslation } from "react-i18next";

const expenseSchema = z.object({
    date: z.date(),
    expense_category_id: z.string().min(1, "Category is required"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    tax_amount: z.number().min(0).optional().nullable(),
    reference_number: z.string().optional().nullable(),
    description: z.string().min(1, "Description is required"),
    supplier_id: z.string().optional().nullable(),
    bank_account_id: z.string().optional().nullable(),
    payment_method: z.string().optional().nullable(),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

interface Props {
    expense: any
    categories: Array<{ id: number, name: string }>
    suppliers: Array<{ id: number, name: string }>
    bankAccounts: Array<{ id: number, bank_name: string, account_number: string }>
}

export default function Edit({ expense, categories, suppliers, bankAccounts }: Props) {
    const { t } = useTranslation()
    const form = useReactHookForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema) as any,
        defaultValues: {
            date: new Date(expense.date),
            expense_category_id: expense.expense_category_id.toString(),
            amount: parseFloat(expense.amount),
            tax_amount: expense.tax_amount ? parseFloat(expense.tax_amount) : 0,
            reference_number: expense.reference_number || "",
            description: expense.description,
            supplier_id: expense.supplier_id ? expense.supplier_id.toString() : "0",
            bank_account_id: expense.bank_account_id ? expense.bank_account_id.toString() : "",
            payment_method: expense.payment_method || "",
        },
    })

    const onSubmit = (values: ExpenseFormValues) => {
        import('@inertiajs/react').then(({ router }) => {
            router.put(route('purchase.expenses.update', expense.id), {
                ...values,
                expense_category_id: parseInt(values.expense_category_id),
                supplier_id: values.supplier_id && values.supplier_id !== "0" ? parseInt(values.supplier_id) : null,
                bank_account_id: values.bank_account_id ? parseInt(values.bank_account_id) : null,
            } as any)
        })
    }

    return (
        <DashboardLayout header={t('expenses.editHeader', { id: expense.id })}>
            <Head title={t('expenses.editTitle', { id: expense.id })} />

            <div className="max-w-4xl mx-auto py-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column: Details */}
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>{t('expenses.details')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>{t('expenses.date')}</FormLabel>
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
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>{t('expenses.pickDate')}</span>
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
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('expenses.description')}</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="expense_category_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('expenses.category')}</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('expenses.selectCategory')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                                {category.name}
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
                                        name="supplier_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('expenses.payee')}</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value || "0"}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('expenses.selectSupplier')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="0">None / General</SelectItem>
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
                                </CardContent>
                            </Card>

                            {/* Right Column: Payment & Amounts */}
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>{t('expenses.paymentAmount')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('expenses.amount')}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="bank_account_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('expenses.paidFrom')}</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('expenses.selectAccount')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {bankAccounts.map((account) => (
                                                            <SelectItem key={account.id} value={account.id.toString()}>
                                                                {account.bank_name} - {account.account_number || 'Cash'}
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
                                                <FormLabel>{t('expenses.reference')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="payment_method"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payment Method</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select method" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                        <SelectItem value="Cash">Cash</SelectItem>
                                                        <SelectItem value="Cheque">Cheque</SelectItem>
                                                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                                                        <SelectItem value="DuitNow/QR">DuitNow/QR</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" asChild>
                                <Link href={route('purchase.expenses.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>Update Expense</Button>
                        </div>
                    </form>
                </Form>
            </div>
        </DashboardLayout>
    )
}
