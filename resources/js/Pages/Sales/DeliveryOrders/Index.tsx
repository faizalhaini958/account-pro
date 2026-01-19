import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { DataTable } from "@/Components/ui/data-table"
import { columns, DeliveryOrder } from "./columns"
import { Button } from "@/Components/ui/button"
import { Plus, CalendarIcon, Loader2, Trash2 } from "lucide-react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"
import { Calendar } from "@/Components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"

interface IndexProps {
    deliveryOrders: any
    customers: Array<{ id: number, name: string, company_name?: string }>
    products: Array<{ id: number, name: string, sku: string }>
}

interface DeliveryOrderItem {
    product_id: string
    description: string
    quantity: number
}

export default function Index({ deliveryOrders, customers, products }: IndexProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: "",
        date: new Date(),
        delivered_at: undefined as Date | undefined,
        delivery_address: "",
        notes: "",
        items: [
            { product_id: "", description: "", quantity: 1 }
        ] as DeliveryOrderItem[]
    })

    const handleAddItem = () => {
        setData("items", [
            ...data.items,
            { product_id: "", description: "", quantity: 1 }
        ])
    }

    const handleRemoveItem = (index: number) => {
        if (data.items.length <= 1) return
        const newItems = data.items.filter((_, i) => i !== index)
        setData("items", newItems)
    }

    const handleItemChange = (index: number, field: keyof DeliveryOrderItem, value: any) => {
        const newItems = [...data.items]

        if (field === 'product_id') {
            const product = products.find(p => p.id.toString() === value)
            if (product) {
                newItems[index] = {
                    ...newItems[index],
                    product_id: value,
                    description: product.name,
                }
            } else {
                newItems[index] = { ...newItems[index], [field]: value }
            }
        } else {
            newItems[index] = { ...newItems[index], [field]: value }
        }

        setData("items", newItems)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('sales.delivery-orders.store'), {
            onSuccess: () => {
                setOpen(false)
                reset()
            },
        })
    }

    return (
        <DashboardLayout header={t('deliveryOrders.title')}>
            <Head title={t('deliveryOrders.title')} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{t('deliveryOrders.title')}</h2>
                    <div className="flex items-center space-x-2">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('deliveryOrders.create')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{t('deliveryOrders.create')}</DialogTitle>
                                    <DialogDescription>
                                        {t('deliveryOrders.new')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="customer_id">{t('sales.customer')}</Label>
                                            <Select
                                                value={data.customer_id}
                                                onValueChange={(val) => setData("customer_id", val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('user.selectCompany')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {customers?.map((customer) => (
                                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                                            {customer.name} {customer.company_name ? `(${customer.company_name})` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.customer_id && <p className="text-sm text-red-500">{errors.customer_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>{t('sales.date')}</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !data.date && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {data.date ? (
                                                            format(data.date, "dd/MM/yyyy")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={data.date}
                                                        onSelect={(date) => date && setData("date", date)}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>{t('deliveryOrders.deliveryDate')} {t('common.optional')}</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !data.delivered_at && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {data.delivered_at ? (
                                                            format(data.delivered_at, "dd/MM/yyyy")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={data.delivered_at}
                                                        onSelect={(date) => setData("delivered_at", date)}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="delivery_address">{t('deliveryOrders.deliveryAddress')}</Label>
                                            <Input
                                                id="delivery_address"
                                                value={data.delivery_address}
                                                onChange={(e) => setData("delivery_address", e.target.value)}
                                                placeholder={t('deliveryOrders.deliveryAddressPlaceholder')}
                                            />
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <div className="border rounded-md p-4 bg-muted/20">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium">{t('invoices.items')}</h3>
                                        </div>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[30%]">{t('products.name')}</TableHead>
                                                    <TableHead className="w-[40%]">{t('products.description')}</TableHead>
                                                    <TableHead className="w-[20%]">Qty</TableHead>
                                                    <TableHead className="w-[10%]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.items.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Select
                                                                value={item.product_id}
                                                                onValueChange={(val) => handleItemChange(index, "product_id", val)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder={t('user.selectCompany')} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {products?.map((p) => (
                                                                        <SelectItem key={p.id} value={p.id.toString()}>
                                                                            {p.sku}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                value={item.description}
                                                                onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                step="1"
                                                                value={item.quantity}
                                                                onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveItem(index)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <div className="mt-4">
                                            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                                <Plus className="mr-2 h-4 w-4" /> {t('common.create')}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">{t('quotations.notes')}</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData("notes", e.target.value)}
                                            placeholder={t('quotations.notesPlaceholder')}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            {t('common.cancel')}
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {t('deliveryOrders.create')}
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
                        data={deliveryOrders.data}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
