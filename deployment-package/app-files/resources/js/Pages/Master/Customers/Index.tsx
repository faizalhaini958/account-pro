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
import { Switch } from "@/Components/ui/switch"

export default function Index({ customers }: { customers: any }) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        code: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "Malaysia",
        tax_identification_number: "",
        credit_limit: "",
        credit_days: "",
        is_active: true,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('master.customers.store'), {
            onSuccess: () => {
                setOpen(false)
                reset()
            },
        })
    }

    return (
        <DashboardLayout header={t('customers.title')}>
            <Head title={t('customers.title')} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{t('customers.title')}</h2>
                    <div className="flex items-center space-x-2">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('customers.new')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{t('customers.createTitle')}</DialogTitle>
                                    <DialogDescription>
                                        {t('customers.createDesc')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <Label htmlFor="name">{t('customers.name')} *</Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData("name", e.target.value)}
                                                    required
                                                />
                                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="code">{t('customers.code')}</Label>
                                                <Input
                                                    id="code"
                                                    value={data.code}
                                                    onChange={(e) => setData("code", e.target.value)}
                                                    placeholder={t('customers.codePlaceholder')}
                                                />
                                                {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="tax_identification_number">{t('customers.taxId')}</Label>
                                                <Input
                                                    id="tax_identification_number"
                                                    value={data.tax_identification_number}
                                                    onChange={(e) => setData("tax_identification_number", e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="email">{t('customers.email')}</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData("email", e.target.value)}
                                                />
                                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="phone">{t('customers.phone')}</Label>
                                                <Input
                                                    id="phone"
                                                    value={data.phone}
                                                    onChange={(e) => setData("phone", e.target.value)}
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <Label htmlFor="address">{t('customers.address')}</Label>
                                                <Textarea
                                                    id="address"
                                                    value={data.address}
                                                    onChange={(e) => setData("address", e.target.value)}
                                                    rows={2}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="city">{t('customers.city')}</Label>
                                                <Input
                                                    id="city"
                                                    value={data.city}
                                                    onChange={(e) => setData("city", e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="postal_code">{t('customers.postalCode')}</Label>
                                                <Input
                                                    id="postal_code"
                                                    value={data.postal_code}
                                                    onChange={(e) => setData("postal_code", e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="state">{t('customers.state')}</Label>
                                                <Input
                                                    id="state"
                                                    value={data.state}
                                                    onChange={(e) => setData("state", e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="country">{t('customers.country')}</Label>
                                                <Input
                                                    id="country"
                                                    value={data.country}
                                                    onChange={(e) => setData("country", e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="credit_limit">{t('customers.creditLimit')}</Label>
                                                <Input
                                                    id="credit_limit"
                                                    type="number"
                                                    value={data.credit_limit}
                                                    onChange={(e) => setData("credit_limit", e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="credit_days">{t('customers.creditDays')}</Label>
                                                <Input
                                                    id="credit_days"
                                                    type="number"
                                                    value={data.credit_days}
                                                    onChange={(e) => setData("credit_days", e.target.value)}
                                                />
                                            </div>

                                            <div className="col-span-2 flex items-center space-x-2">
                                                <Switch
                                                    id="is_active"
                                                    checked={data.is_active}
                                                    onCheckedChange={(checked) => setData("is_active", checked)}
                                                />
                                                <Label htmlFor="is_active">{t('master.isActiveStatus')}</Label>
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            {t('master.cancel')}
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {t('customers.createTitle')}
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
                        data={customers.data}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
