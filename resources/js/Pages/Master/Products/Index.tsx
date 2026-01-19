import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, router, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { DataTable } from "@/Components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/Components/ui/button"
import { Plus } from "lucide-react"
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
import { Checkbox } from "@/Components/ui/checkbox"

export default function Index({ products, categories }: { products: any; categories: any }) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        sku: "",
        type: "product",
        retail_price: "",
        purchase_cost: "",
        description: "",
        track_inventory: true,
        current_stock: "0",
        is_active: true,
        product_category_id: "",
    })

    const handleBulkDelete = (selectedProducts: any[]) => {
        if (confirm(t('master.bulkDeleteConfirm', { count: selectedProducts.length }))) {
            const ids = selectedProducts.map(p => p.id)
            router.delete(route('master.products.destroy', ids[0]), {
                data: { ids },
                preserveScroll: true,
            })
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('master.products.store'), {
            onSuccess: () => {
                setOpen(false)
                reset()
            },
        })
    }

    return (
        <DashboardLayout header={t('products.title')}>
            <Head title={t('products.title')} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{t('products.title')}</h2>
                    <div className="flex items-center space-x-2">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('products.new')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{t('products.createTitle')}</DialogTitle>
                                    <DialogDescription>
                                        {t('products.createDesc')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">{t('products.name')} *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData("name", e.target.value)}
                                                placeholder={t('products.namePlaceholder')}
                                                required
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="sku">{t('products.sku')}</Label>
                                                <Input
                                                    id="sku"
                                                    value={data.sku}
                                                    onChange={(e) => setData("sku", e.target.value)}
                                                    placeholder={t('products.skuPlaceholder')}
                                                />
                                                {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="type">{t('products.type')}</Label>
                                                <Select value={data.type} onValueChange={(val) => setData("type", val)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="product">{t('products.type.product')}</SelectItem>
                                                        <SelectItem value="service">{t('products.type.service')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="retail_price">{t('products.retailPrice')} *</Label>
                                                <Input
                                                    id="retail_price"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.retail_price}
                                                    onChange={(e) => setData("retail_price", e.target.value)}
                                                    required
                                                />
                                                {errors.retail_price && <p className="text-sm text-red-500">{errors.retail_price}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="purchase_cost">{t('products.purchaseCost')} *</Label>
                                                <Input
                                                    id="purchase_cost"
                                                    type="number"
                                                    step="0.01"
                                                    value={data.purchase_cost}
                                                    onChange={(e) => setData("purchase_cost", e.target.value)}
                                                    required
                                                />
                                                {errors.purchase_cost && <p className="text-sm text-red-500">{errors.purchase_cost}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="description">{t('products.description')}</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData("description", e.target.value)}
                                                placeholder={t('products.descriptionPlaceholder')}
                                                rows={2}
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="track_inventory"
                                                checked={data.track_inventory}
                                                onCheckedChange={(checked) => setData("track_inventory", !!checked)}
                                            />
                                            <Label htmlFor="track_inventory">{t('products.trackInventory')}</Label>
                                        </div>

                                        {data.track_inventory && (
                                            <>
                                                <div>
                                                    <Label htmlFor="product_category_id">{t('products.category')}</Label>
                                                    <Select
                                                        value={data.product_category_id}
                                                        onValueChange={(val) => setData("product_category_id", val)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('products.selectCategory')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories?.map((cat: any) => (
                                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                                    {cat.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="current_stock">{t('products.currentStock')}</Label>
                                                    <Input
                                                        id="current_stock"
                                                        type="number"
                                                        value={data.current_stock}
                                                        onChange={(e) => setData("current_stock", e.target.value)}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData("is_active", !!checked)}
                                            />
                                            <Label htmlFor="is_active">{t('master.isActive')}</Label>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            {t('master.cancel')}
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {t('products.createTitle')}
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
                        data={products.data}
                        onBulkDelete={handleBulkDelete}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
