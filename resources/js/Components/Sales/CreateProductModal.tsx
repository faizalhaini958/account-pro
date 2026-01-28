import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import { Switch } from "@/Components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateProductModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (product: any) => void
}

export function CreateProductModal({ open, onOpenChange, onSuccess }: CreateProductModalProps) {
    const { t } = useTranslation()
    const { toast } = useToast()
    const [processing, setProcessing] = useState(false)
    const [errors, setErrors] = useState<any>({})
    const [data, setData] = useState({
        name: "",
        sku: "",
        type: "product",
        retail_price: "",
        purchase_cost: "0",
        description: "",
        track_inventory: false,
        current_stock: "",
        is_active: true,
    })

    const handleChange = (field: string, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        // Clear error when field changes
        if (errors[field]) {
            setErrors((prev: any) => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setProcessing(true)
        setErrors({})

        try {
            const response = await axios.post(route('master.products.store'), {
                ...data,
                retail_price: parseFloat(data.retail_price) || 0,
                purchase_cost: parseFloat(data.purchase_cost) || 0,
                current_stock: data.track_inventory ? (parseFloat(data.current_stock) || 0) : 0,
            }, {
                headers: {
                    'Accept': 'application/json',
                }
            })

            const newProduct = response.data

            toast({
                title: t('common.success'),
                description: t('products.createTitle') + ' ' + t('common.success'),
            })
            onSuccess(newProduct)

            // Reset form
            setData({
                name: "",
                sku: "",
                type: "product",
                retail_price: "",
                purchase_cost: "0",
                description: "",
                track_inventory: false,
                current_stock: "",
                is_active: true,
            })

        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors)
            } else {
                toast({
                    title: t('common.error'),
                    description: t('common.error'),
                    variant: "destructive",
                })
                console.error(error)
            }
        } finally {
            setProcessing(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('products.createTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('products.createDesc')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="name">{t('products.name')} *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name[0]}</p>}
                            </div>

                            <div>
                                <Label htmlFor="sku">{t('products.sku')}</Label>
                                <Input
                                    id="sku"
                                    value={data.sku}
                                    onChange={(e) => handleChange("sku", e.target.value)}
                                    placeholder="Optional"
                                />
                                {errors.sku && <p className="text-sm text-red-500">{errors.sku[0]}</p>}
                            </div>

                            <div>
                                <Label htmlFor="type">{t('products.type')} *</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(val) => handleChange("type", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="product">{t('products.typeProduct')}</SelectItem>
                                        <SelectItem value="service">{t('products.typeService')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-sm text-red-500">{errors.type[0]}</p>}
                            </div>

                            <div>
                                <Label htmlFor="retail_price">{t('products.retailPrice')} *</Label>
                                <Input
                                    id="retail_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.retail_price}
                                    onChange={(e) => handleChange("retail_price", e.target.value)}
                                    required
                                />
                                {errors.retail_price && <p className="text-sm text-red-500">{errors.retail_price[0]}</p>}
                            </div>

                            <div>
                                <Label htmlFor="purchase_cost">{t('products.purchaseCost')}</Label>
                                <Input
                                    id="purchase_cost"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.purchase_cost}
                                    onChange={(e) => handleChange("purchase_cost", e.target.value)}
                                />
                                {errors.purchase_cost && <p className="text-sm text-red-500">{errors.purchase_cost[0]}</p>}
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="description">{t('products.description')}</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    rows={2}
                                />
                                {errors.description && <p className="text-sm text-red-500">{errors.description[0]}</p>}
                            </div>

                            {data.type === "product" && (
                                <>
                                    <div className="col-span-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="track_inventory"
                                                checked={data.track_inventory}
                                                onCheckedChange={(checked) => handleChange("track_inventory", checked)}
                                            />
                                            <Label htmlFor="track_inventory">{t('products.trackInventory')}</Label>
                                        </div>
                                    </div>

                                    {data.track_inventory && (
                                        <div>
                                            <Label htmlFor="current_stock">{t('products.currentStock')}</Label>
                                            <Input
                                                id="current_stock"
                                                type="number"
                                                step="1"
                                                min="0"
                                                value={data.current_stock}
                                                onChange={(e) => handleChange("current_stock", e.target.value)}
                                            />
                                            {errors.current_stock && <p className="text-sm text-red-500">{errors.current_stock[0]}</p>}
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="col-span-2">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => handleChange("is_active", checked)}
                                    />
                                    <Label htmlFor="is_active">{t('common.active')}</Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('common.create')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
