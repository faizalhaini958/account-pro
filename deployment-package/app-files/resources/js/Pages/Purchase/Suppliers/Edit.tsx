import { useState } from "react"
import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, useForm, Link } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import { Switch } from "@/Components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/Components/ui/form"
import { useForm as useReactHookForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useTranslation } from "react-i18next";

const supplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    company_name: z.string().optional().nullable(),
    email: z.string().email("Invalid email").optional().or(z.literal('')).nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    postcode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    tax_id: z.string().optional().nullable(),
    bank_name: z.string().optional().nullable(),
    bank_account_number: z.string().optional().nullable(),
    bank_account_name: z.string().optional().nullable(),
    payment_terms: z.number().min(0).optional().nullable(),
    notes: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
})

type SupplierFormValues = z.infer<typeof supplierSchema>

interface Props {
    supplier: any
}

export default function Edit({ supplier }: Props) {
    const { t } = useTranslation()
    const form = useReactHookForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema) as any,
        defaultValues: {
            name: supplier.name,
            company_name: supplier.company_name,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            city: supplier.city,
            state: supplier.state,
            postcode: supplier.postcode,
            country: supplier.country || "Malaysia",
            tax_id: supplier.tax_id,
            bank_name: supplier.bank_name,
            bank_account_number: supplier.bank_account_number,
            bank_account_name: supplier.bank_account_name,
            payment_terms: supplier.payment_terms || 30,
            notes: supplier.notes,
            is_active: Boolean(supplier.is_active),
        },
    })

    const onSubmit = (values: SupplierFormValues) => {
        import('@inertiajs/react').then(({ router }) => {
            router.put(route('purchase.suppliers.update', supplier.id), values as any)
        })
    }

    return (
        <DashboardLayout header={t('suppliers.editHeader', { name: supplier.name })}>
            <Head title={t('suppliers.editTitle', { name: supplier.name })} />

            <div className="max-w-4xl mx-auto py-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('suppliers.basicInfo')}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('suppliers.contactName')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="e.g. John Doe" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="company_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('suppliers.companyName')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} placeholder="e.g. Acme Corp" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('suppliers.email')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" value={field.value || ''} placeholder="john@example.com" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('suppliers.phone')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} placeholder="+60123456789" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm pb-2">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">{t('suppliers.activeStatus')}</FormLabel>
                                                <FormDescription>
                                                    {t('suppliers.activeStatusDesc')}
                                                </FormDescription>
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

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('suppliers.addressLocation')}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>{t('suppliers.address')}</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} value={field.value || ''} placeholder="Full address" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('suppliers.city')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('suppliers.state')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="postcode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('suppliers.postcode')}</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('suppliers.country')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('suppliers.financialDetails')}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="tax_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('suppliers.taxId')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="payment_terms"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('suppliers.paymentTerms')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    value={field.value || 0}
                                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bank_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('suppliers.bankName')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bank_account_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('suppliers.accountNumber')}</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>{t('purchaseInvoices.notes')}</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} value={field.value || ''} placeholder={t('suppliers.internalNotes')} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" asChild>
                                <Link href={route('purchase.suppliers.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>Update Supplier</Button>
                        </div>
                    </form>
                </Form>
            </div>
        </DashboardLayout>
    )
}
