import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, useForm } from "@inertiajs/react"
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
import { Separator } from "@/Components/ui/separator"

export default function Index({ suppliers }: { suppliers: any }) {
    const [open, setOpen] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        company_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postcode: "",
        country: "Malaysia",
        tax_id: "",
        bank_name: "",
        bank_account_number: "",
        bank_account_name: "",
        payment_terms: "30",
        notes: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('purchase.suppliers.store'), {
            onSuccess: () => {
                setOpen(false)
                reset()
            },
        })
    }

    const { t } = useTranslation()

    return (
        <DashboardLayout header={t('suppliers.title')}>
            <Head title={t('suppliers.title')} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{t('suppliers.title')}</h2>
                    <div className="flex items-center space-x-2">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('suppliers.new')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{t('suppliers.createTitle')}</DialogTitle>
                                    <DialogDescription>
                                        {t('suppliers.createDesc')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">{t('suppliers.basicInfo')}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">{t('suppliers.contactName')}</Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData("name", e.target.value)}
                                                    placeholder="e.g. John Doe"
                                                    required
                                                />
                                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="company_name">{t('suppliers.companyName')}</Label>
                                                <Input
                                                    id="company_name"
                                                    value={data.company_name}
                                                    onChange={(e) => setData("company_name", e.target.value)}
                                                    placeholder="e.g. Acme Corp"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">{t('suppliers.email')}</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData("email", e.target.value)}
                                                    placeholder="john@example.com"
                                                />
                                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">{t('suppliers.phone')}</Label>
                                                <Input
                                                    id="phone"
                                                    value={data.phone}
                                                    onChange={(e) => setData("phone", e.target.value)}
                                                    placeholder="+60123456789"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">{t('suppliers.addressLocation')}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-1 md:col-span-2 space-y-2">
                                                <Label htmlFor="address">{t('suppliers.address')}</Label>
                                                <Textarea
                                                    id="address"
                                                    value={data.address}
                                                    onChange={(e) => setData("address", e.target.value)}
                                                    placeholder="Full address"
                                                    rows={2}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="city">{t('suppliers.city')}</Label>
                                                <Input
                                                    id="city"
                                                    value={data.city}
                                                    onChange={(e) => setData("city", e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="state">{t('suppliers.state')}</Label>
                                                    <Input
                                                        id="state"
                                                        value={data.state}
                                                        onChange={(e) => setData("state", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="postcode">{t('suppliers.postcode')}</Label>
                                                    <Input
                                                        id="postcode"
                                                        value={data.postcode}
                                                        onChange={(e) => setData("postcode", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="country">{t('suppliers.country')}</Label>
                                                <Input
                                                    id="country"
                                                    value={data.country}
                                                    onChange={(e) => setData("country", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">{t('suppliers.financialDetails')}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="tax_id">{t('suppliers.taxId')}</Label>
                                                <Input
                                                    id="tax_id"
                                                    value={data.tax_id}
                                                    onChange={(e) => setData("tax_id", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="payment_terms">{t('suppliers.paymentTerms')}</Label>
                                                <Input
                                                    id="payment_terms"
                                                    type="number"
                                                    value={data.payment_terms}
                                                    onChange={(e) => setData("payment_terms", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="bank_name">{t('suppliers.bankName')}</Label>
                                                <Input
                                                    id="bank_name"
                                                    value={data.bank_name}
                                                    onChange={(e) => setData("bank_name", e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="bank_account_number">{t('suppliers.accountNumber')}</Label>
                                                <Input
                                                    id="bank_account_number"
                                                    value={data.bank_account_number}
                                                    onChange={(e) => setData("bank_account_number", e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-1 md:col-span-2 space-y-2">
                                                <Label htmlFor="notes">{t('purchaseInvoices.notes')}</Label>
                                                <Textarea
                                                    id="notes"
                                                    value={data.notes}
                                                    onChange={(e) => setData("notes", e.target.value)}
                                                    placeholder={t('suppliers.internalNotes')}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            {t('common.cancel')}
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {t('suppliers.create')}
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
                        data={suppliers.data}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
