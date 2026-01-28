import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { useRef, useState } from "react"
import { Loader2, Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"

interface Props {
    tenant: any
    coa_assets: any[]
    coa_income: any[]
    coa_liabilities: any[]
}

const MALAYSIA_STATES = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan",
    "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah",
    "Sarawak", "Selangor", "Terengganu", "Wilayah Persekutuan Kuala Lumpur",
    "Wilayah Persekutuan Labuan", "Wilayah Persekutuan Putrajaya"
]

const COUNTRIES = [
    "Malaysia", "Singapore", "Indonesia", "Thailand", "Brunei", "Vietnam", "Philippines", "Other"
]

export default function Index({ tenant, coa_assets, coa_income, coa_liabilities }: Props) {
    const { t } = useTranslation()
    const [processing, setProcessing] = useState(false)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Helper to get nested GL value safely
    const getGlSetting = (key: string, defaultVal: string) => {
        return tenant.settings?.gl?.[key] || defaultVal
    }

    const { data, setData, post, errors } = useForm({
        name: tenant.name || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        address_1: tenant.address_1 || "",
        address_2: tenant.address_2 || "",
        city: tenant.city || "",
        state: tenant.state || "",
        postcode: tenant.postcode || "",
        country: tenant.country || "Malaysia",
        website: tenant.website || "",
        sst_number: tenant.sst_number || "",
        sst_rate: tenant.sst_rate || 6.00,
        logo: null as File | null,
        gl_settings: {
            ar_account: getGlSetting('ar_account', '1200'),
            sales_account: getGlSetting('sales_account', '4001'),
            tax_account: getGlSetting('tax_account', '2102'),
        },
    })

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setData("logo", file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setProcessing(true)
        post(route('master.settings.update'), {
            onFinish: () => setProcessing(false),
            forceFormData: true,
        })
    }

    return (
        <DashboardLayout header={t('settings.title')}>
            <Head title={t('settings.title')} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="mx-auto max-w-screen-2xl w-full">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Tabs defaultValue="profile" className="w-full">
                            <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto bg-transparent">
                                <TabsTrigger
                                    value="profile"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                                >
                                    {t('settings.companyProfile')}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="accounting"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                                >
                                    {t('settings.accountingTax')}
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-6">
                                <TabsContent value="profile" className="mt-0 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{t('settings.companyInfo')}</CardTitle>
                                            <CardDescription>
                                                {t('settings.companyInfoDesc')}
                                            </CardDescription>
                                        </CardHeader>
                                        {/* ... content ... */}
                                        <CardContent className="space-y-4">
                                            {/* Logo Section */}
                                            {/* Logo Section */}
                                            <div className="flex items-center gap-6 pb-6 border-b">
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="cursor-pointer group relative"
                                                >
                                                    <Avatar className="h-24 w-24 border-2 border-muted">
                                                        <AvatarImage src={logoPreview || tenant.logo_url} className="object-cover" />
                                                        <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                                                            {data.name.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                                                        <Camera className="text-white h-6 w-6" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-medium leading-none">{t('settings.companyLogo')}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Click the avatar to upload a new logo.
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
                                                        >
                                                            Upload New
                                                        </Button>
                                                        {(logoPreview || tenant.logo_url) && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                type="button"
                                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                onClick={() => {
                                                                    setData("logo", null);
                                                                    setLogoPreview(null);
                                                                }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleLogoChange}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label>{t('settings.companyName')}</Label>
                                                    <Input
                                                        value={data.name}
                                                        onChange={e => setData("name", e.target.value)}
                                                    />
                                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>{t('settings.registrationNo')}</Label>
                                                    <Input disabled value={tenant.ssm_number || ''} placeholder={t('settings.setDuringOnboarding')} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label>{t('settings.email')}</Label>
                                                    <Input
                                                        type="email"
                                                        value={data.email}
                                                        onChange={e => setData("email", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>{t('settings.phone')}</Label>
                                                    <Input
                                                        value={data.phone}
                                                        onChange={e => setData("phone", e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>{t('settings.address')}</Label>
                                                <div className="space-y-2">
                                                    <Input
                                                        value={data.address_1}
                                                        onChange={e => setData("address_1", e.target.value)}
                                                        placeholder="Address Line 1"
                                                    />
                                                    <Input
                                                        value={data.address_2}
                                                        onChange={e => setData("address_2", e.target.value)}
                                                        placeholder="Address Line 2 (Optional)"
                                                    />
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <Input
                                                            value={data.postcode}
                                                            onChange={e => setData("postcode", e.target.value)}
                                                            placeholder="Postcode"
                                                        />
                                                        <Input
                                                            value={data.city}
                                                            onChange={e => setData("city", e.target.value)}
                                                            placeholder="City"
                                                        />
                                                        <Input
                                                            value={data.state}
                                                            onChange={e => setData("state", e.target.value)}
                                                            placeholder="State"
                                                        />
                                                    </div>
                                                    <Input
                                                        value={data.country}
                                                        onChange={e => setData("country", e.target.value)}
                                                        placeholder="Country"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>{t('settings.website')}</Label>
                                                <Input
                                                    value={data.website}
                                                    onChange={e => setData("website", e.target.value)}
                                                    placeholder="https://..."
                                                />
                                                {errors.website && <p className="text-sm text-red-500">{errors.website}</p>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="accounting" className="mt-0 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{t('settings.taxSettings')}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label>{t('settings.sstNumber')}</Label>
                                                    <Input
                                                        value={data.sst_number}
                                                        onChange={e => setData("sst_number", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>{t('settings.defaultTaxRate')}</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={data.sst_rate}
                                                        onChange={e => setData("sst_rate", Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{t('settings.glMapping')}</CardTitle>
                                            <CardDescription>
                                                {t('settings.glMappingDesc')}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label>{t('settings.arAccount')}</Label>
                                                    <Select
                                                        value={data.gl_settings.ar_account}
                                                        onValueChange={val => setData('gl_settings', { ...data.gl_settings, ar_account: val })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('settings.selectAccount')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {coa_assets.map((acc: any) => (
                                                                <SelectItem key={acc.id} value={acc.code}>
                                                                    {acc.code} - {acc.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>{t('settings.salesAccount')}</Label>
                                                    <Select
                                                        value={data.gl_settings.sales_account}
                                                        onValueChange={val => setData('gl_settings', { ...data.gl_settings, sales_account: val })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('settings.selectAccount')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {coa_income.map((acc: any) => (
                                                                <SelectItem key={acc.id} value={acc.code}>
                                                                    {acc.code} - {acc.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>{t('settings.taxAccount')}</Label>
                                                    <Select
                                                        value={data.gl_settings.tax_account}
                                                        onValueChange={val => setData('gl_settings', { ...data.gl_settings, tax_account: val })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={t('settings.selectAccount')} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {coa_liabilities.map((acc: any) => (
                                                                <SelectItem key={acc.id} value={acc.code}>
                                                                    {acc.code} - {acc.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </div>

                        </Tabs>

                        <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                {t('master.cancel')}
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('settings.save')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    )
}
