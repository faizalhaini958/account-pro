import { useForm, Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { FormEvent, useEffect } from "react"
import { format } from "date-fns"
import DashboardLayout from "@/Layouts/DashboardLayout"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Label } from "@/Components/ui/label"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import InputError from "@/Components/InputError"
import { formatCurrency } from "@/lib/format"

interface Props {
    invoice: any
    bankAccounts: any[]
}

export default function Payment({ invoice, bankAccounts }: Props) {
    const { t } = useTranslation()

    const { data, setData, post, processing, errors } = useForm({
        customer_id: invoice.customer_id,
        bank_account_id: '',
        date: new Date().toISOString().split('T')[0],
        reference_number: '',
        payment_method: 'Bank Transfer',
        amount: invoice.outstanding_amount,
        notes: `Payment for ${invoice.number}`,
        allocations: [
            {
                invoice_id: invoice.id,
                amount: invoice.outstanding_amount
            }
        ]
    })

    // Update allocation amount when main amount changes
    useEffect(() => {
        setData('allocations', [
            {
                invoice_id: invoice.id,
                amount: data.amount
            }
        ])
    }, [data.amount])

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        post(route('sales.receipts.store'))
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href={route('sales.invoices.index')}
                            className="flex items-center text-muted-foreground hover:text-foreground mb-2"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight">Record Payment</h2>
                        <p className="text-muted-foreground">
                            Record a payment for Invoice {invoice.number}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Invoice Details Card */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Invoice No.</span>
                                <span className="font-medium">{invoice.number}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Customer</span>
                                <span className="font-medium">{invoice.customer.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Original Total</span>
                                <span className="font-medium">{formatCurrency(invoice.total)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Paid Amount</span>
                                <span className="font-medium text-green-600">{formatCurrency(invoice.paid_amount)}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground font-bold">Outstanding</span>
                                <span className="font-bold text-red-600">{formatCurrency(invoice.outstanding_amount)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Form Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                            <CardDescription>Enter the payment details below.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={data.date}
                                            onChange={(e) => setData('date', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.date} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="payment_method">Payment Method</Label>
                                        <Select
                                            value={data.payment_method}
                                            onValueChange={(value) => setData('payment_method', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                                <SelectItem value="Cheque">Cheque</SelectItem>
                                                <SelectItem value="Credit Card">Credit Card</SelectItem>
                                                <SelectItem value="DuitNow/QR">DuitNow/QR</SelectItem>
                                                <SelectItem value="Online Transfer">Online Transfer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.payment_method} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bank_account">Deposit To</Label>
                                        <Select
                                            value={data.bank_account_id}
                                            onValueChange={(value) => setData('bank_account_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select bank account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bankAccounts.map((account) => (
                                                    <SelectItem key={account.id} value={account.id.toString()}>
                                                        {account.bank_name} - {account.account_number}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.bank_account_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reference_number">Reference</Label>
                                        <Input
                                            id="reference_number"
                                            value={data.reference_number}
                                            onChange={(e) => setData('reference_number', e.target.value)}
                                            placeholder="e.g. TRX-123456"
                                        />
                                        <InputError message={errors.reference_number} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', parseFloat(e.target.value))}
                                        required
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        This will automatically allocate this amount to the current invoice.
                                    </p>
                                    <InputError message={errors.amount} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                    <InputError message={errors.notes} />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Record Payment
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
