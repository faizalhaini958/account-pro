import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

interface ChartOfAccount {
    id: number;
    code: string;
    name: string;
}

interface Company {
    id: number;
    name: string;
    slug: string;
    ssm_number: string | null;
    sst_number: string | null;
    address: string | null;
    address_1: string | null;
    address_2: string | null;
    city: string | null;
    state: string | null;
    postcode: string | null;
    country: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    currency: string;
    timezone: string;
    financial_year_start: string | null;
    sst_enabled: boolean;
    sst_rate: number;
    logo_url: string | null;
    logo_path: string | null;
    gl_settings: {
        ar_account: string;
        sales_account: string;
        tax_account: string;
    };
}

interface CompanyEditProps {
    company: Company;
    coa_assets: ChartOfAccount[];
    coa_income: ChartOfAccount[];
    coa_liabilities: ChartOfAccount[];
}

export default function CompanyEdit({ company, coa_assets, coa_income, coa_liabilities }: CompanyEditProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        ssm_number: company.ssm_number || '',
        sst_number: company.sst_number || '',
        address_1: company.address_1 || company.address || '',
        address_2: company.address_2 || '',
        city: company.city || '',
        state: company.state || '',
        postcode: company.postcode || '',
        country: company.country || 'Malaysia',
        website: company.website || '',
        currency: company.currency || 'MYR',
        timezone: company.timezone || 'Asia/Kuala_Lumpur',
        financial_year_start: company.financial_year_start || '',
        sst_enabled: company.sst_enabled || false,
        sst_rate: company.sst_rate || 6.00,
        logo: null as File | null,
        gl_settings: {
            ar_account: company.gl_settings?.ar_account || '',
            sales_account: company.gl_settings?.sales_account || '',
            tax_account: company.gl_settings?.tax_account || '',
        },
        _method: 'PATCH',
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('companies.update', company.id), {
            forceFormData: true,
        });
    };

    return (
        <DashboardLayout>
            <Head title={`Edit ${company.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('companies.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Edit Company</h2>
                        <p className="text-muted-foreground">{company.name}</p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className="grid gap-6">
                        {/* Logo Card - Always visible at top */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Company Logo</CardTitle>
                                <CardDescription>
                                    This logo will appear on your invoices and documents
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-6">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="cursor-pointer group relative"
                                    >
                                        <Avatar className="h-24 w-24 border-2 border-muted">
                                            <AvatarImage
                                                src={logoPreview || company.logo_url || undefined}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                                                {data.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                                            <Camera className="text-white h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
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
                                            {(logoPreview || company.logo_url) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    type="button"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => {
                                                        setData('logo', null);
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
                            </CardContent>
                        </Card>

                        {/* Tabbed Content */}
                        <Card>
                            <CardContent className="pt-6">
                                <Tabs defaultValue="company" className="w-full">
                                    <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto bg-transparent mb-6">
                                        <TabsTrigger
                                            value="company"
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                                        >
                                            Company & Address
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="settings"
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                                        >
                                            Operational Settings
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="gl"
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                                        >
                                            GL Account Mapping
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Tab 1: Company & Address */}
                                    <TabsContent value="company" className="space-y-6 mt-0">
                                        <div>
                                            <h3 className="text-lg font-medium mb-4">Company Information</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Company Name *</Label>
                                                    <Input
                                                        id="name"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        required
                                                    />
                                                    {errors.name && (
                                                        <p className="text-sm text-destructive">{errors.name}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="ssm_number">SSM Registration Number</Label>
                                                    <Input
                                                        id="ssm_number"
                                                        value={data.ssm_number}
                                                        onChange={(e) => setData('ssm_number', e.target.value)}
                                                    />
                                                    {errors.ssm_number && (
                                                        <p className="text-sm text-destructive">{errors.ssm_number}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                    />
                                                    {errors.email && (
                                                        <p className="text-sm text-destructive">{errors.email}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone</Label>
                                                    <Input
                                                        id="phone"
                                                        value={data.phone}
                                                        onChange={(e) => setData('phone', e.target.value)}
                                                    />
                                                    {errors.phone && (
                                                        <p className="text-sm text-destructive">{errors.phone}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2 mt-4">
                                                <Label htmlFor="website">Website</Label>
                                                <Input
                                                    id="website"
                                                    type="url"
                                                    placeholder="https://example.com"
                                                    value={data.website}
                                                    onChange={(e) => setData('website', e.target.value)}
                                                />
                                                {errors.website && (
                                                    <p className="text-sm text-destructive">{errors.website}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t pt-6">
                                            <h3 className="text-lg font-medium mb-4">Address</h3>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="address_1">Address Line 1</Label>
                                                    <Input
                                                        id="address_1"
                                                        value={data.address_1}
                                                        onChange={(e) => setData('address_1', e.target.value)}
                                                        placeholder="Street address"
                                                    />
                                                    {errors.address_1 && (
                                                        <p className="text-sm text-destructive">{errors.address_1}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="address_2">Address Line 2 (Optional)</Label>
                                                    <Input
                                                        id="address_2"
                                                        value={data.address_2}
                                                        onChange={(e) => setData('address_2', e.target.value)}
                                                        placeholder="Apartment, suite, etc."
                                                    />
                                                    {errors.address_2 && (
                                                        <p className="text-sm text-destructive">{errors.address_2}</p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="postcode">Postcode</Label>
                                                        <Input
                                                            id="postcode"
                                                            value={data.postcode}
                                                            onChange={(e) => setData('postcode', e.target.value)}
                                                        />
                                                        {errors.postcode && (
                                                            <p className="text-sm text-destructive">{errors.postcode}</p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="city">City</Label>
                                                        <Input
                                                            id="city"
                                                            value={data.city}
                                                            onChange={(e) => setData('city', e.target.value)}
                                                        />
                                                        {errors.city && (
                                                            <p className="text-sm text-destructive">{errors.city}</p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="state">State</Label>
                                                        <Input
                                                            id="state"
                                                            value={data.state}
                                                            onChange={(e) => setData('state', e.target.value)}
                                                        />
                                                        {errors.state && (
                                                            <p className="text-sm text-destructive">{errors.state}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="country">Country</Label>
                                                    <Input
                                                        id="country"
                                                        value={data.country}
                                                        onChange={(e) => setData('country', e.target.value)}
                                                    />
                                                    {errors.country && (
                                                        <p className="text-sm text-destructive">{errors.country}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Tab 2: Operational Settings */}
                                    <TabsContent value="settings" className="space-y-6 mt-0">
                                        <div>
                                            <h3 className="text-lg font-medium mb-4">Regional Settings</h3>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="currency">Currency</Label>
                                                    <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
                                                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                            <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.currency && (
                                                        <p className="text-sm text-destructive">{errors.currency}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="timezone">Timezone</Label>
                                                    <Select value={data.timezone} onValueChange={(value) => setData('timezone', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur</SelectItem>
                                                            <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.timezone && (
                                                        <p className="text-sm text-destructive">{errors.timezone}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="financial_year_start">Financial Year Start</Label>
                                                    <Input
                                                        id="financial_year_start"
                                                        type="date"
                                                        value={data.financial_year_start}
                                                        onChange={(e) => setData('financial_year_start', e.target.value)}
                                                    />
                                                    {errors.financial_year_start && (
                                                        <p className="text-sm text-destructive">{errors.financial_year_start}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t pt-6">
                                            <h3 className="text-lg font-medium mb-4">Tax Settings</h3>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="sst_number">SST Registration Number</Label>
                                                    <Input
                                                        id="sst_number"
                                                        value={data.sst_number}
                                                        onChange={(e) => setData('sst_number', e.target.value)}
                                                    />
                                                    {errors.sst_number && (
                                                        <p className="text-sm text-destructive">{errors.sst_number}</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label htmlFor="sst_enabled">Enable SST</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Enable Sales and Service Tax for this company
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        id="sst_enabled"
                                                        checked={data.sst_enabled}
                                                        onCheckedChange={(checked) => setData('sst_enabled', checked)}
                                                    />
                                                </div>

                                                {data.sst_enabled && (
                                                    <div className="space-y-2">
                                                        <Label htmlFor="sst_rate">Default SST Rate (%)</Label>
                                                        <Input
                                                            id="sst_rate"
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            className="w-1/3"
                                                            value={data.sst_rate}
                                                            onChange={(e) => setData('sst_rate', parseFloat(e.target.value))}
                                                        />
                                                        {errors.sst_rate && (
                                                            <p className="text-sm text-destructive">{errors.sst_rate}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Tab 3: GL Account Mapping */}
                                    <TabsContent value="gl" className="space-y-6 mt-0">
                                        <div>
                                            <h3 className="text-lg font-medium mb-2">GL Account Mapping</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Map default accounts for system transactions
                                            </p>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="ar_account">Accounts Receivable (Debtors)</Label>
                                                    <Select
                                                        value={data.gl_settings.ar_account}
                                                        onValueChange={(val) => setData('gl_settings', { ...data.gl_settings, ar_account: val })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select account" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {coa_assets.map((acc) => (
                                                                <SelectItem key={acc.id} value={acc.code}>
                                                                    {acc.code} - {acc.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="sales_account">Sales / Revenue</Label>
                                                    <Select
                                                        value={data.gl_settings.sales_account}
                                                        onValueChange={(val) => setData('gl_settings', { ...data.gl_settings, sales_account: val })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select account" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {coa_income.map((acc) => (
                                                                <SelectItem key={acc.id} value={acc.code}>
                                                                    {acc.code} - {acc.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mt-4">
                                                <Label htmlFor="tax_account">Tax Payable (SST Output)</Label>
                                                <Select
                                                    value={data.gl_settings.tax_account}
                                                    onValueChange={(val) => setData('gl_settings', { ...data.gl_settings, tax_account: val })}
                                                >
                                                    <SelectTrigger className="w-1/2">
                                                        <SelectValue placeholder="Select account" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {coa_liabilities.map((acc) => (
                                                            <SelectItem key={acc.id} value={acc.code}>
                                                                {acc.code} - {acc.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('companies.index')}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
