import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { formatCurrency } from "@/lib/format"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Badge } from "@/Components/ui/badge"
import { useTranslation } from "react-i18next";

interface Props {
    payment: {
        id: number
        date: string
        created_at: string
        reference_number: string
        amount: number
        payment_method: string
        notes: string
        supplier: {
            name: string
            contact_person: string
            email: string
        }
        bank_account: {
            bank_name: string
            account_number: string
            account_name: string
        }
        allocations: Array<{
            id: number
            amount: number
            purchase_invoice: {
                id: number
                reference_number: string
                date: string
                total: number
            }
        }>
    }
}

export default function Show({ payment }: Props) {
    const { t } = useTranslation()
    return (
        <DashboardLayout header={t('payments.viewHeader', { reference: payment.reference_number })}>
            <Head title={t('payments.viewHeader', { reference: payment.reference_number })} />

            <div className="max-w-4xl mx-auto py-6">
                <div className="space-y-6">
                    {/* Header Actions */}
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                            {t('payments.recordedOn', { date: format(new Date(payment.created_at || new Date()), "PPP") })}
                        </div>
                        <div className="space-x-2">
                            <Button variant="outline" asChild>
                                <Link href={route('purchase.payments.index')}>{t('common.backToList')}</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Payment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('payments.details')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">{t('payments.reference')}</span>
                                    <span>{payment.reference_number}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">{t('payments.date')}</span>
                                    <span>{format(new Date(payment.date), "dd/MM/yyyy")}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">{t('payments.amount')}</span>
                                    <span className="font-bold text-lg">{formatCurrency(parseFloat(payment.amount.toString()))}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium">{t('payments.method')}</span>
                                    <Badge variant="outline">{payment.payment_method}</Badge>
                                </div>
                                {payment.notes && (
                                    <div className="pt-2">
                                        <span className="font-medium block mb-1">{t('payments.notes')}</span>
                                        <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">{payment.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Beneficiary & Payer */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('payments.parties')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t('payments.paidTo')}</h4>
                                    <div className="text-lg font-medium">{payment.supplier.name}</div>
                                    <div className="text-sm">{payment.supplier.contact_person}</div>
                                    <div className="text-sm">{payment.supplier.email}</div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t('payments.paidFrom')}</h4>
                                    <div className="font-medium">{payment.bank_account.bank_name}</div>
                                    <div className="text-sm">{payment.bank_account.account_name}</div>
                                    <div className="text-sm font-mono">{payment.bank_account.account_number}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Allocations Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('payments.allocations')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('payments.invoiceNo')}</TableHead>
                                        <TableHead>{t('payments.invoiceDate')}</TableHead>
                                        <TableHead className="text-right">{t('payments.invoiceTotal')}</TableHead>
                                        <TableHead className="text-right">{t('payments.allocatedAmount')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payment.allocations.length > 0 ? (
                                        payment.allocations.map(allocation => (
                                            <TableRow key={allocation.id}>
                                                <TableCell className="font-medium">
                                                    <Link href={route('purchase.invoices.edit', allocation.purchase_invoice?.id || 0)} className="text-blue-600 hover:underline">
                                                        {allocation.purchase_invoice?.reference_number || 'N/A'}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    {allocation.purchase_invoice ? format(new Date(allocation.purchase_invoice.date), "dd/MM/yyyy") : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {allocation.purchase_invoice ? formatCurrency(parseFloat(allocation.purchase_invoice.total.toString())) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {formatCurrency(parseFloat(allocation.amount.toString()))}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                                                No invoices allocated to this payment (On Account).
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
