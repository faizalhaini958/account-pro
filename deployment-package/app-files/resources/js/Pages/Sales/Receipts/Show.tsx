import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { formatCurrency } from "@/lib/format"
import { format } from "date-fns"
import { Separator } from "@/Components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { ArrowLeft } from "lucide-react"

interface Props {
    receipt: any
}

export default function Show({ receipt }: Props) {
    const { t } = useTranslation()
    return (
        <DashboardLayout header={`${t('receipts.single')} ${receipt.reference_number}`}>
            <Head title={`${t('receipts.single')} ${receipt.reference_number}`} />

            <div className="max-w-4xl mx-auto py-6 space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                    <Button variant="ghost" asChild>
                        <Link href={route('sales.receipts.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('common.back')}
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('receipts.info')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('receipts.reference')}</span>
                                <span className="font-medium">{receipt.reference_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('sales.date')}</span>
                                <span>{format(new Date(receipt.date), "dd/MM/yyyy")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('sales.customer')}</span>
                                <span className="font-medium">{receipt.customer?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('receipts.paymentMethod')}</span>
                                <span>{receipt.payment_method}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('receipts.amountReceived')}</span>
                                <span className="font-bold text-lg">{formatCurrency(parseFloat(receipt.amount))}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('receipts.bankAndNotes')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('receipts.account')}</span>
                                <span>{receipt.bank_account?.bank_name} - {receipt.bank_account?.name}</span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-sm">{t('quotations.notes')}</span>
                                <p className="text-sm bg-muted p-3 rounded-md min-h-[80px]">
                                    {receipt.notes || t('common.noNotes')}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-sm">{t('common.createdBy')}</span>
                                <p className="text-sm">{receipt.creator?.name || t('common.system')}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('receipts.allocatedInvoices')}</CardTitle>
                        <CardDescription>{t('receipts.allocationDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {receipt.allocations.length === 0 ? (
                            <p className="text-muted-foreground py-4 text-center">{t('receipts.unallocatedPayment')}</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('invoices.number')}</TableHead>
                                        <TableHead>{t('sales.date')}</TableHead>
                                        <TableHead className="text-right">{t('invoices.total')}</TableHead>
                                        <TableHead className="text-right">{t('receipts.allocatedAmount')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {receipt.allocations.map((allocation: any) => (
                                        <TableRow key={allocation.id}>
                                            <TableCell className="font-medium">
                                                {allocation.invoice?.reference_number}
                                            </TableCell>
                                            <TableCell>
                                                {allocation.invoice ? format(new Date(allocation.invoice.date), "dd/MM/yyyy") : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {allocation.invoice ? formatCurrency(parseFloat(allocation.invoice.total)) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {formatCurrency(parseFloat(allocation.amount))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
