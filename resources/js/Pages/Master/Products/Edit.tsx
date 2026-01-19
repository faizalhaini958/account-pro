import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, router } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Checkbox } from "@/Components/ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().optional().nullable(),
    type: z.enum(["product", "service"]),
    retail_price: z.number().min(0, "Price must be positive"),
    purchase_cost: z.number().min(0, "Cost must be positive"),
    description: z.string().optional().nullable(),
    track_inventory: z.boolean(),
    current_stock: z.number().min(0, "Stock cannot be negative").optional(),
    is_active: z.boolean(),
    product_category_id: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface Props {
    product: any
    categories: any[]
}

export default function Edit({ product, categories }: Props) {
    const { t } = useTranslation()
    const [processing, setProcessing] = useState(false)

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: product.name,
            product_category_id: product.product_category_id ? product.product_category_id.toString() : "", // Set default value for category
            sku: product.sku,
            type: product.type,
            retail_price: parseFloat(product.retail_price),
            purchase_cost: parseFloat(product.purchase_cost),
            description: product.description,
            track_inventory: Boolean(product.track_inventory),
            current_stock: parseFloat(product.current_stock || 0),
            is_active: Boolean(product.is_active),
        }
    })

    const onSubmit = (data: ProductFormValues) => {
        setProcessing(true)
        router.put(route('master.products.update', product.id), data as any, {
            onFinish: () => setProcessing(false)
        })
    }

    return (
        <DashboardLayout header={`${t('products.editTitle')} ${product.name}`}>
            <Head title={`${t('products.editTitle')} ${product.name}`} />

            <div className="max-w-2xl mx-auto py-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('products.details')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t('products.name')}</Label>
                                <Input {...form.register("name")} placeholder={t('products.namePlaceholder')} />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('products.sku')}</Label>
                                    <Input {...form.register("sku")} placeholder={t('products.skuPlaceholder')} />
                                    {form.formState.errors.sku && (
                                        <p className="text-sm text-red-500">{form.formState.errors.sku.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('products.type')}</Label>
                                    <Select
                                        value={form.watch("type")}
                                        onValueChange={(val: any) => form.setValue("type", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="product">{t('products.type.product')}</SelectItem>
                                            <SelectItem value="service">{t('products.type.service')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t('products.retailPrice')}</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...form.register("retail_price", { valueAsNumber: true })}
                                    />
                                    {form.formState.errors.retail_price && (
                                        <p className="text-sm text-red-500">{form.formState.errors.retail_price.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('products.purchaseCost')}</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...form.register("purchase_cost", { valueAsNumber: true })}
                                    />
                                    {form.formState.errors.purchase_cost && (
                                        <p className="text-sm text-red-500">{form.formState.errors.purchase_cost.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('products.description')}</Label>
                                <Textarea {...form.register("description")} placeholder={t('products.descriptionPlaceholder')} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={form.watch("track_inventory")}
                                    onCheckedChange={(val) => form.setValue("track_inventory", !!val)}
                                />
                                <Label>{t('products.trackInventory')}</Label>
                            </div>

                            {form.watch("track_inventory") && (
                                <div className="space-y-2">
                                    <Label>{t('products.currentStock')}</Label>
                                    <Input
                                        type="number"
                                        step="1"
                                        {...form.register("current_stock", { valueAsNumber: true })}
                                    />
                                    {form.formState.errors.current_stock && (
                                        <p className="text-sm text-red-500">{form.formState.errors.current_stock.message}</p>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={form.watch("is_active")}
                                    onCheckedChange={(val) => form.setValue("is_active", !!val)}
                                />
                                <Label>{t('master.isActive')}</Label>
                            </div>

                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button variant="outline" asChild>
                            <Link href={route('master.products.index')}>{t('master.cancel')}</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>{t('common.saveChanges')}</Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    )
}
