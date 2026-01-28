import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, useForm, router } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Switch } from "@/Components/ui/switch"
import { Loader2, ArrowLeft } from "lucide-react"

interface Props {
    account: any
    parents: any[]
    types: Record<string, string>
}

export default function Edit({ account, parents, types }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        code: account.code,
        name: account.name,
        type: account.type,
        subtype: account.subtype || "",
        parent_id: account.parent_id ? account.parent_id.toString() : "",
        description: account.description || "",
        is_active: Boolean(account.is_active),
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(route('accounting.coa.update', account.id))
    }

    return (
        <DashboardLayout header={`Edit Account: ${account.code}`}>
            <Head title={`Edit Account ${account.code}`} />

            <div className="max-w-2xl mx-auto py-6 space-y-6">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href={route('accounting.coa.index')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Chart of Accounts
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Edit Account</CardTitle>
                        <CardDescription>
                            Update account details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Account Code *</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={e => setData("code", e.target.value)}
                                    // Disable code edit for system accounts if strictness required, currently allowed but warned in backend
                                    />
                                    {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Account Type *</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={val => setData("type", val)}
                                        disabled={account.is_system}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(types).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                                    {account.is_system && <p className="text-xs text-muted-foreground">Specific system types cannot be changed.</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Account Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData("name", e.target.value)}
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="parent_id">Parent Account</Label>
                                <Select
                                    value={data.parent_id}
                                    onValueChange={val => setData("parent_id", val === "none" ? "" : val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Parent</SelectItem>
                                        {parents.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.code} - {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData("description", e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between border p-4 rounded-md">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Active Status</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Inactive accounts cannot be used.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={val => setData("is_active", val)}
                                />
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('accounting.coa.index')}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
