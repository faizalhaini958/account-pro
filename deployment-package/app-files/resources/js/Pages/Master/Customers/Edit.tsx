import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import { Switch } from "@/Components/ui/switch"

interface Customer {
    id: number
    name: string
    code: string | null
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    postal_code: string | null
    country: string | null
    tax_identification_number: string | null
    credit_limit: number | null
    credit_days: number | null
    is_active: boolean
}

export default function Edit({ customer }: { customer: Customer }) {
    const { t } = useTranslation()
    const { data, setData, put, processing, errors } = useForm({
        name: customer.name || "",
        code: customer.code || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
        postal_code: customer.postal_code || "",
        country: customer.country || "Malaysia",
        tax_identification_number: customer.tax_identification_number || "",
        credit_limit: customer.credit_limit?.toString() || "",
        credit_days: customer.credit_days?.toString() || "",
        is_active: customer.is_active,
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        put(route('master.customers.update', customer.id))
    }

    return (
        <DashboardLayout header={`${t('customers.editTitle')}: ${customer.name}`}>
            <Head title={`${t('customers.editTitle')}: ${customer.name}`} />

            <div className="max-w-2xl mx-auto py-6">
                <form onSubmit={submit} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('customers.details')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label htmlFor="name">{t('customers.name')}</Label>
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
                                        placeholder="e.g. CUST-001"
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
                                    {errors.tax_identification_number && <p className="text-sm text-red-500">{errors.tax_identification_number}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">{t('customers.address')}</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData("address", e.target.value)}
                                />
                                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('customers.creditTerms')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="credit_limit">{t('customers.creditLimit')}</Label>
                                    <Input
                                        id="credit_limit"
                                        type="number"
                                        value={data.credit_limit}
                                        onChange={(e) => setData("credit_limit", e.target.value)}
                                    />
                                    {errors.credit_limit && <p className="text-sm text-red-500">{errors.credit_limit}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="credit_days">{t('customers.creditDays')}</Label>
                                    <Input
                                        id="credit_days"
                                        type="number"
                                        value={data.credit_days}
                                        onChange={(e) => setData("credit_days", e.target.value)}
                                    />
                                    {errors.credit_days && <p className="text-sm text-red-500">{errors.credit_days}</p>}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData("is_active", checked)}
                                />
                                <Label htmlFor="is_active">{t('master.isActiveStatus')}</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button variant="outline" asChild>
                            <Link href={route('master.customers.index')}>{t('master.cancel')}</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>{t('common.saveChanges')}</Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    )
}
