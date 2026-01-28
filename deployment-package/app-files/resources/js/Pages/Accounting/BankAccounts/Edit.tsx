import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, useForm } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Checkbox } from "@/Components/ui/checkbox"

interface ChartOfAccount {
    id: number
    code: string
    name: string
}

interface BankAccount {
    id: number
    name: string
    account_number: string
    bank_name: string
    chart_of_account_id: number
    is_active: boolean
}

interface BankAccountEditProps {
    bankAccount: BankAccount
    chartOfAccounts: ChartOfAccount[]
}

export default function BankAccountEdit({ bankAccount, chartOfAccounts }: BankAccountEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: bankAccount.name,
        account_number: bankAccount.account_number,
        bank_name: bankAccount.bank_name,
        chart_of_account_id: bankAccount.chart_of_account_id.toString(),
        is_active: bankAccount.is_active,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(route('accounting.bank-accounts.update', bankAccount.id))
    }

    return (
        <DashboardLayout header="Edit Bank Account">
            <Head title="Edit Bank Account" />

            <div className="p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Bank Account Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Account Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="bank_name">Bank Name *</Label>
                                    <Input
                                        id="bank_name"
                                        value={data.bank_name}
                                        onChange={(e) => setData('bank_name', e.target.value)}
                                    />
                                    {errors.bank_name && <p className="text-sm text-red-600 mt-1">{errors.bank_name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="account_number">Account Number *</Label>
                                    <Input
                                        id="account_number"
                                        value={data.account_number}
                                        onChange={(e) => setData('account_number', e.target.value)}
                                    />
                                    {errors.account_number && <p className="text-sm text-red-600 mt-1">{errors.account_number}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="chart_of_account_id">GL Account *</Label>
                                    <Select
                                        value={data.chart_of_account_id}
                                        onValueChange={(value) => setData('chart_of_account_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {chartOfAccounts.map((account) => (
                                                <SelectItem key={account.id} value={account.id.toString()}>
                                                    {account.code} - {account.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.chart_of_account_id && <p className="text-sm text-red-600 mt-1">{errors.chart_of_account_id}</p>}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Active
                                </Label>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    Update Bank Account
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
