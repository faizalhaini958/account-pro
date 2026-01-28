import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { DataTable } from "@/Components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/Components/ui/button"
import { Plus, CalendarIcon, Loader2, Trash2, FileSignature, QrCode, PlusCircle } from "lucide-react"
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
import { formatCurrency } from "@/lib/format"
import { Checkbox } from "@/Components/ui/checkbox"
import { CreateCustomerModal } from "@/Components/Sales/CreateCustomerModal"
import { CreateProductModal } from "@/Components/Sales/CreateProductModal"

interface IndexProps {
    invoices: any
    customers: Array<{ id: number, name: string }>
    products: Array<{ id: number, name: string, retail_price: number }>
    tenant: {
        id: number
        signature_url: string | null
        signature_name: string | null
    }
}

interface InvoiceItem {
    product_id: string
    description: string
    quantity: number
    unit_price: number
    tax_percent: number
}

export default function Index({ invoices, customers, products, tenant }: IndexProps) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)

    // Manage customers list locally to support adding new ones
    const [customersList, setCustomersList] = useState(customers)
    const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false)

    // Manage products list locally to support adding new ones
    const [productsList, setProductsList] = useState(products)
    const [showCreateProductModal, setShowCreateProductModal] = useState(false)
    const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null)

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: "",
        reference_number: "",
        date: new Date(),
        due_date: new Date(),
        notes: "",
        include_signature: false,
        include_qr_code: true,
        items: [
            { product_id: "", description: "", quantity: 1, unit_price: 0, tax_percent: 0 }
        ] as InvoiceItem[]
    })

    const handleAddItem = () => {
        setData("items", [
            ...data.items,
            { product_id: "", description: "", quantity: 1, unit_price: 0, tax_percent: 0 }
        ])
    }

    const handleRemoveItem = (index: number) => {
        if (data.items.length <= 1) return
        const newItems = data.items.filter((_, i) => i !== index)
        setData("items", newItems)
    }

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...data.items]

        if (field === 'product_id') {
            if (value === '_new_') {
                setCurrentItemIndex(index)
                setShowCreateProductModal(true)
                return
            }
            const product = productsList.find(p => p.id.toString() === value)
            if (product) {
                newItems[index] = {
                    ...newItems[index],
                    product_id: value,
                    description: product.name,
                    unit_price: product.retail_price || 0
                }
            } else {
                newItems[index] = { ...newItems[index], [field]: value }
            }
        } else {
            newItems[index] = { ...newItems[index], [field]: value }
        }

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
        post(route('sales.invoices.store'), {
            onSuccess: () => {
                setOpen(false)
                reset()
            },
        })
    }

    const handleCustomerCreated = (newCustomer: any) => {
        setCustomersList(prev => [...prev, newCustomer])
        setData("customer_id", newCustomer.id.toString())
        setShowCreateCustomerModal(false)
    }

    const handleProductCreated = (newProduct: any) => {
        setProductsList(prev => [...prev, newProduct])
        // If we know which item row triggered the modal, auto-select the new product
        if (currentItemIndex !== null) {
            const newItems = [...data.items]
            newItems[currentItemIndex] = {
                ...newItems[currentItemIndex],
                product_id: newProduct.id.toString(),
                description: newProduct.name,
                unit_price: newProduct.retail_price || 0
            }
            setData("items", newItems)
        }
        setShowCreateProductModal(false)
        setCurrentItemIndex(null)
    }

    return (
        <DashboardLayout header={t('invoices.title')}>
            <Head title={t('invoices.title')} />

            <CreateCustomerModal
                open={showCreateCustomerModal}
                onOpenChange={setShowCreateCustomerModal}
                onSuccess={handleCustomerCreated}
            />

            <CreateProductModal
                open={showCreateProductModal}
                onOpenChange={(open) => {
                    setShowCreateProductModal(open)
                    if (!open) setCurrentItemIndex(null)
                }}
                onSuccess={handleProductCreated}
            />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{t('invoices.title')}</h2>
                    <div className="flex items-center space-x-2">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('invoices.new')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{t('invoices.create')}</DialogTitle>
                                    <DialogDescription>
                                        {t('invoices.new')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="col-span-1 lg:col-span-2 space-y-2">
                                            <Label htmlFor="customer_id">{t('sales.customer')}</Label>
                                            <Select
                                                value={data.customer_id}
                                                onValueChange={(val) => {
                                                    if (val === '_new_') {
                                                        setShowCreateCustomerModal(true)
                                                    } else {
                                                        setData("customer_id", val)
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('user.selectCompany')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="_new_" className="text-primary font-medium bg-primary/10 hover:bg-primary/20 cursor-pointer">
                                                        <span className="flex items-center">
                                                            <PlusCircle className="w-4 h-4 mr-2" />
                                                            {t('customers.new')}
                                                        </span>
                                                    </SelectItem>
                                                    {customersList?.map((customer) => (
                                                        <SelectItem key={customer.id} value={customer.id.toString()}>
                                                            {customer.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.customer_id && <p className="text-sm text-red-500">{errors.customer_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="reference_number">{t('invoices.reference')}</Label>
                                            <Input
                                                id="reference_number"
                                                value={data.reference_number}
                                                onChange={(e) => setData("reference_number", e.target.value)}
                                                placeholder="Optional"
                                            />
                                            {errors.reference_number && <p className="text-sm text-red-500">{errors.reference_number}</p>}
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
                                                    <TableHead className="w-[20%]">{t('products.description')}</TableHead>
                                                    <TableHead className="w-[10%]">Qty</TableHead>
                                                    <TableHead className="w-[15%]">{t('products.retailPrice')}</TableHead>
                                                    <TableHead className="w-[10%]">Tax %</TableHead>
                                                    <TableHead className="w-[15%] text-right">{t('sales.amount')}</TableHead>
                                                    <TableHead className="w-[5%]"></TableHead>
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
                                                                    <SelectValue placeholder="Select" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="_new_" className="text-primary font-medium bg-primary/10 hover:bg-primary/20 cursor-pointer">
                                                                        <span className="flex items-center">
                                                                            <PlusCircle className="w-4 h-4 mr-2" />
                                                                            {t('products.new')}
                                                                        </span>
                                                                    </SelectItem>
                                                                    {productsList?.map((p) => (
                                                                        <SelectItem key={p.id} value={p.id.toString()}>
                                                                            {p.name}
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
                                                {t('sales.amount')}: {formatCurrency(calculateTotal())}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">{t('quotations.notes')}</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData("notes", e.target.value)}
                                            placeholder="Terms and conditions..."
                                        />
                                    </div>

                                    {/* Signature Option */}
                                    {tenant?.signature_url && (
                                        <div className="border rounded-lg p-4 bg-muted/30">
                                            <div className="flex items-start space-x-3">
                                                <Checkbox
                                                    id="include_signature"
                                                    checked={data.include_signature}
                                                    onCheckedChange={(checked) => setData("include_signature", checked as boolean)}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <label
                                                        htmlFor="include_signature"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <FileSignature className="h-4 w-4" />
                                                        Include Company Signature
                                                    </label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Add your company signature to this invoice
                                                    </p>
                                                    {data.include_signature && tenant.signature_url && (
                                                        <div className="mt-2 bg-white dark:bg-gray-900 border rounded p-2 inline-block">
                                                            <img
                                                                src={tenant.signature_url}
                                                                alt="Signature"
                                                                className="max-h-12 object-contain"
                                                            />
                                                            {tenant.signature_name && (
                                                                <p className="text-xs text-center mt-1">{tenant.signature_name}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* QR Code Option */}
                                    <div className="border rounded-lg p-4 bg-muted/30">
                                        <div className="flex items-start space-x-3">
                                            <Checkbox
                                                id="include_qr_code"
                                                checked={data.include_qr_code}
                                                onCheckedChange={(checked) => setData("include_qr_code", checked as boolean)}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <label
                                                    htmlFor="include_qr_code"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                                                >
                                                    <QrCode className="h-4 w-4" />
                                                    Include QR Code
                                                </label>
                                                <p className="text-sm text-muted-foreground">
                                                    Add a QR code for invoice verification (e-Invoice compliance)
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            {t('common.cancel')}
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {t('invoices.create')}
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
