"use client"

import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, useForm } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Switch } from "@/Components/ui/switch"
import { Loader2 } from "lucide-react"

interface Props {
    settings: {
        einvoice_enabled: boolean
        tin: string
        brn: string
        sst_registration_number: string
        is_sst_registered: boolean
        myinvois_sandbox_mode: boolean
        einvoice_classification: string
        myinvois_client_id: string
        myinvois_client_secret: string
    }
}

export default function Settings({ settings }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        einvoice_enabled: settings.einvoice_enabled || false,
        tin: settings.tin || "",
        brn: settings.brn || "",
        sst_registration_number: settings.sst_registration_number || "",
        is_sst_registered: settings.is_sst_registered || false,
        myinvois_sandbox_mode: settings.myinvois_sandbox_mode || false,
        einvoice_classification: settings.einvoice_classification || "",
        myinvois_client_id: settings.myinvois_client_id || "",
        myinvois_client_secret: settings.myinvois_client_secret || "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('einvoice.settings.update'), {
            preserveScroll: true,
        })
    }

    return (
        <DashboardLayout header="e-Invoice Settings">
            <Head title="e-Invoice Settings" />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">e-Invoice Settings</h2>
                        <p className="text-muted-foreground">Configure your e-Invoice integration settings.</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>General Configuration</CardTitle>
                                <CardDescription>
                                    Manage your LHDN e-Invoice integration status and credentials.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="einvoice_enabled"
                                        checked={data.einvoice_enabled}
                                        onCheckedChange={(checked) => setData("einvoice_enabled", checked)}
                                    />
                                    <Label htmlFor="einvoice_enabled">Enable e-Invoice Integration</Label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="tin">Tax Identification Number (TIN)</Label>
                                        <Input
                                            id="tin"
                                            value={data.tin}
                                            onChange={(e) => setData("tin", e.target.value)}
                                            placeholder="e.g. C1234567890"
                                        />
                                        {errors.tin && <p className="text-sm text-red-500">{errors.tin}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="brn">Business Registration Number (BRN)</Label>
                                        <Input
                                            id="brn"
                                            value={data.brn}
                                            onChange={(e) => setData("brn", e.target.value)}
                                            placeholder="e.g. 202301000001"
                                        />
                                        {errors.brn && <p className="text-sm text-red-500">{errors.brn}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sst_registration_number">SST Registration Number</Label>
                                        <Input
                                            id="sst_registration_number"
                                            value={data.sst_registration_number}
                                            onChange={(e) => setData("sst_registration_number", e.target.value)}
                                            placeholder="Optional"
                                        />
                                        {errors.sst_registration_number && <p className="text-sm text-red-500">{errors.sst_registration_number}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="einvoice_classification">Classification Code</Label>
                                        <Input
                                            id="einvoice_classification"
                                            value={data.einvoice_classification}
                                            onChange={(e) => setData("einvoice_classification", e.target.value)}
                                            placeholder="Default classification"
                                        />
                                        {errors.einvoice_classification && <p className="text-sm text-red-500">{errors.einvoice_classification}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_sst_registered"
                                        checked={data.is_sst_registered}
                                        onCheckedChange={(checked) => setData("is_sst_registered", checked)}
                                    />
                                    <Label htmlFor="is_sst_registered">SST Registered Business</Label>
                                </div>

                                <div className="border-t pt-6 mt-6">
                                    <h3 className="text-lg font-medium mb-4">MyInvois API Credentials</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="myinvois_client_id">Client ID</Label>
                                            <Input
                                                id="myinvois_client_id"
                                                value={data.myinvois_client_id}
                                                onChange={(e) => setData("myinvois_client_id", e.target.value)}
                                                placeholder="Enter Client ID to update"
                                                type="password"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="myinvois_client_secret">Client Secret</Label>
                                            <Input
                                                id="myinvois_client_secret"
                                                value={data.myinvois_client_secret}
                                                onChange={(e) => setData("myinvois_client_secret", e.target.value)}
                                                placeholder="Enter Client Secret to update"
                                                type="password"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-4">
                                        <Switch
                                            id="myinvois_sandbox_mode"
                                            checked={data.myinvois_sandbox_mode}
                                            onCheckedChange={(checked) => setData("myinvois_sandbox_mode", checked)}
                                        />
                                        <Label htmlFor="myinvois_sandbox_mode">Sandbox Mode (Test Environment)</Label>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing}>
                                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    )
}
