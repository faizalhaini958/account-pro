import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/Components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Switch } from "@/Components/ui/switch"
import { useForm as useReactHookForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTranslation } from "react-i18next";

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional().or(z.literal('')),
    account_id: z.string().min(1, "Account is required"),
    is_active: z.boolean().default(true),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface Props {
    category: any
    accounts: Array<{ id: number, code: string, name: string }>
}

export default function Edit({ category, accounts }: Props) {
    const { t } = useTranslation()
    const form = useReactHookForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema) as any,
        defaultValues: {
            name: category.name,
            description: category.description || "",
            account_id: category.account_id ? category.account_id.toString() : "",
            is_active: Boolean(category.is_active),
        },
    })

    const onSubmit = (values: CategoryFormValues) => {
        import('@inertiajs/react').then(({ router }) => {
            router.put(route('purchase.expense-categories.update', category.id), {
                ...values,
                account_id: parseInt(values.account_id)
            } as any)
        })
    }

    return (
        <DashboardLayout header={t('expenseCategories.editHeader', { name: category.name })}>
            <Head title={t('expenseCategories.editHeader', { name: category.name })} />

            <div className="max-w-2xl mx-auto py-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('expenseCategories.editTitle')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('expenseCategories.name')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder={t('expenseCategories.namePlaceholder')} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="account_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('expenseCategories.account')}</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('expenseCategories.selectAccount')} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {accounts.map(account => (
                                                        <SelectItem key={account.id} value={account.id.toString()}>
                                                            <span className="font-mono text-muted-foreground mr-2">{account.code}</span>
                                                            {account.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                {t('expenseCategories.accountHelp')}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('expenseCategories.description')}</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} value={field.value || ''} placeholder={t('expenseCategories.descriptionPlaceholder')} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">{t('expenseCategories.isActive')}</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" asChild>
                                <Link href={route('purchase.expense-categories.index')}>{t('common.cancel')}</Link>
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>{t('expenseCategories.update')}</Button>
                        </div>
                    </form>
                </Form>
            </div>
        </DashboardLayout>
    )
}
