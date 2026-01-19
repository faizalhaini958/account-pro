import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, useForm } from "@inertiajs/react"
import { DataTable } from "@/Components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/Components/ui/button"
import { Plus, CalendarIcon, Loader2, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
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
import { formatCurrency } from "@/lib/format"

interface IndexProps {
    invoices: any
    suppliers: Array<{ id: number, name: string }>
    products: Array<{ id: number, name: string, price: string }>
}

interface InvoiceItem {
    product_id: string
    description: string
    quantity: number
    unit_price: number
    tax_percent: number
    track_inventory: boolean
}

export default function Index({ invoices, suppliers, products }: IndexProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({
        supplier_id: "",
        reference_number: "",
        date: new Date(),
        due_date: new Date(),
        notes: "",
        items: [
            { product_id: "", description: "", quantity: 1, unit_price: 0, tax_percent: 0, track_inventory: false }
        ] as InvoiceItem[]
    })

    const handleAddItem = () => {
        setData("items", [
            ...data.items,
            { product_id: "", description: "", quantity: 1, unit_price: 0, tax_percent: 0, track_inventory: false }
        ])
    }

    const handleRemoveItem = (index: number) => {
        if (data.items.length <= 1) return
        const newItems = data.items.filter((_, i) => i !== index)
        setData("items", newItems)
    }

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...data.items]
        newItems[index] = { ...newItems[index], [field]: value }
        setData("items", newItems)
    }

    const calculateTotal = () => {
        return data.items.reduce((acc, item) => {
            const qty = item.quantity || 0
            const price = item.unit_price || 0
            const tax = item.tax_percent || 0
            const lineTotal = qty * price
            const lineTax = lineTotal * (tax / 100)
            return acc + lineTotal + lineTax
        }, 0)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('purchase.invoices.store'), {
            onSuccess: () => {
                setOpen(false)
                reset()
            },
        })
    }

    return (
        <DashboardLayout header={t('purchaseInvoices.title')}>
            <Head title={t('purchaseInvoices.title')} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{t('purchaseInvoices.title')}</h2>
                    <div className="flex items-center space-x-2">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('purchaseInvoices.new')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{t('purchaseInvoices.create')}</DialogTitle>
                                    <DialogDescription>
                                        {t('purchaseInvoices.createDesc')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="col-span-1 lg:col-span-2 space-y-2">
                                            <Label htmlFor="supplier_id">{t('purchaseInvoices.supplier')}</Label>
                                            <Select
                                                value={data.supplier_id}
                                                onValueChange={(val) => setData("supplier_id", val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('purchaseInvoices.selectSupplier')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {suppliers?.map((supplier) => (
                                                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                            {supplier.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.supplier_id && <p className="text-sm text-red-500">{errors.supplier_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reference_number">{t('purchaseInvoices.reference')}</Label>
                                            <Input
                                                id="reference_number"
                                                value={data.reference_number}
                                                onChange={(e) => setData("reference_number", e.target.value)}
                                                placeholder={t('purchaseInvoices.referencePlaceholder')}
                                            />
                                            {errors.reference_number && <p className="text-sm text-red-500">{errors.reference_number}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>{t('purchaseInvoices.date')}</Label>
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
                                                            <span>{t('common.date')}</span>
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
                                    </div>

                                    {/* Items Table */}
                                    <div className="border rounded-md p-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[30%]">{t('products.description')}</TableHead>
                                                    <TableHead className="w-[15%]">Qty</TableHead>
                                                    <TableHead className="w-[20%]">{t('products.retailPrice')}</TableHead>
                                                    <TableHead className="w-[15%]">{t('creditNotes.tax')}</TableHead>
                                                    <TableHead className="text-right">{t('purchaseInvoices.grandTotal').replace(':', '')}</TableHead>
                                                    <TableHead className="w-[5%]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.items.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Input
                                                                value={item.description}
                                                                onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                                                placeholder={t('products.descriptionPlaceholder')}
                                                            />
                                                            {errors[`items.${index}.description` as keyof typeof errors] && (
                                                                <p className="text-sm text-red-500">{errors[`items.${index}.description` as keyof typeof errors]}</p>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="1"
                                                                value={item.quantity}
                                                                onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.unit_price}
                                                                onChange={(e) => handleItemChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="1"
                                                                value={item.tax_percent}
                                                                onChange={(e) => handleItemChange(index, "tax_percent", parseFloat(e.target.value) || 0)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {formatCurrency((item.quantity * item.unit_price) * (1 + (item.tax_percent / 100)))}
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
                                        <div className="mt-4 flex justify-between items-center">
                                            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                                <Plus className="mr-2 h-4 w-4" /> {t('common.create')}
                                            </Button>
                                            <div className="text-lg font-bold">
                                                {t('purchaseInvoices.grandTotal')} {formatCurrency(calculateTotal())}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">{t('purchaseInvoices.notes')}</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData("notes", e.target.value)}
                                            placeholder={t('purchaseInvoices.notes')}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            {t('common.cancel')}
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {t('purchaseInvoices.create')}
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
                        data={invoices.data}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
