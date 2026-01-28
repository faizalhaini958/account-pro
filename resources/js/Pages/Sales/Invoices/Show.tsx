import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, router } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { formatCurrency } from "@/lib/format"
import { format } from "date-fns"
import { Separator } from "@/Components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { ArrowLeft, Download, FileText, Send, FileSignature, Trash2 } from "lucide-react"
import { Badge } from "@/Components/ui/badge"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog"

interface Props {
    invoice: any
    tenant: any
}

export default function Show({ invoice, tenant }: Props) {
    const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleAddCompanySignature = () => {
        setProcessing(true);
        router.post(route('sales.invoices.signature.computer', invoice.id), {}, {
            onFinish: () => {
                setProcessing(false);
                setSignatureDialogOpen(false);
            },
        });
    };

    const handleRemoveSignature = () => {
        if (confirm('Are you sure you want to remove the signature?')) {
            router.delete(route('sales.invoices.signature.remove', invoice.id));
        }
    };

    return (
        <DashboardLayout header={`Invoice ${invoice.reference_number}`}>
            <Head title={`Invoice ${invoice.reference_number}`} />

            <div className="max-w-4xl mx-auto py-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" asChild>
                        <Link href={route('sales.invoices.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Invoices
                        </Link>
                    </Button>
                    <div className="space-x-2">
                        <Button variant="outline" asChild>
                            <a href={route('sales.invoices.pdf', invoice.id)} target="_blank">
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="col-span-2">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Invoice {invoice.reference_number}</CardTitle>
                                    <CardDescription>
                                        Created on {format(new Date(invoice.created_at), "PPP")}
                                    </CardDescription>
                                </div>
                                <Badge variant={
                                    invoice.status === 'paid' ? "default" :
                                        invoice.status === 'posted' ? "secondary" :
                                            invoice.status === 'draft' ? "outline" :
                                                "destructive"
                                } className="uppercase">
                                    {invoice.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Addresses */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Bill To</h4>
                                    <p className="font-medium">{invoice.customer.name}</p>
                                    <p className="text-sm whitespace-pre-line text-muted-foreground">
                                        {invoice.customer.address}
                                    </p>
                                    {invoice.customer.email && <p className="text-sm text-muted-foreground">{invoice.customer.email}</p>}
                                    {invoice.customer.phone && <p className="text-sm text-muted-foreground">{invoice.customer.phone}</p>}
                                </div>
                                <div className="text-right">
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Dates</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-end gap-4">
                                            <span className="text-muted-foreground">Invoice Date:</span>
                                            <span>{format(new Date(invoice.date), "dd/MM/yyyy")}</span>
                                        </div>
                                        <div className="flex justify-end gap-4">
                                            <span className="text-muted-foreground">Due Date:</span>
                                            <span className="font-medium">{format(new Date(invoice.due_date), "dd/MM/yyyy")}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Items */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Tax</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.items.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(parseFloat(item.unit_price))}</TableCell>
                                            <TableCell className="text-right">
                                                {item.tax_percent > 0 ? `${item.tax_percent}%` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(parseFloat(item.total))}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="w-1/2 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{formatCurrency(parseFloat(invoice.subtotal))}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tax</span>
                                        <span>{formatCurrency(parseFloat(invoice.tax_amount))}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>{formatCurrency(parseFloat(invoice.total))}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Paid</span>
                                        <span>{formatCurrency(parseFloat(invoice.paid_amount))}</span>
                                    </div>
                                    <div className="flex justify-between font-medium text-red-600">
                                        <span>Outstanding</span>
                                        <span>{formatCurrency(parseFloat(invoice.outstanding_amount))}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>History & Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Notes</h4>
                                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                    {invoice.notes || "No notes."}
                                </p>
                            </div>

                            {/* TODO: Add Audit Trail / Payment History here later */}
                        </CardContent>
                    </Card>

                    {/* Signature Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileSignature className="h-5 w-5" />
                                Signature
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {invoice.signature_type && invoice.signature_type !== 'none' ? (
                                <div className="space-y-3">
                                    <div className="bg-white dark:bg-gray-900 border rounded-md p-4 text-center">
                                        {invoice.signature_data ? (
                                            <img
                                                src={invoice.signature_data}
                                                alt="Signature"
                                                className="max-h-20 mx-auto object-contain"
                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Signature applied</p>
                                        )}
                                        {invoice.signature_name && (
                                            <p className="text-sm font-medium mt-2">{invoice.signature_name}</p>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-destructive hover:text-destructive"
                                        onClick={handleRemoveSignature}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remove Signature
                                    </Button>
                                </div>
                            ) : (
                                <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full" disabled={!tenant?.signature_url}>
                                            <FileSignature className="w-4 h-4 mr-2" />
                                            {tenant?.signature_url ? 'Add Signature' : 'No Signature Set'}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Signature</DialogTitle>
                                            <DialogDescription>
                                                Add your company signature to this invoice
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            {tenant?.signature_url && (
                                                <div className="border rounded-lg p-4 text-center">
                                                    <p className="text-sm text-muted-foreground mb-2">Company Signature</p>
                                                    <img
                                                        src={tenant.signature_url}
                                                        alt="Company Signature"
                                                        className="max-h-24 mx-auto object-contain"
                                                    />
                                                    {tenant.signature_name && (
                                                        <p className="text-sm font-medium mt-2">{tenant.signature_name}</p>
                                                    )}
                                                </div>
                                            )}
                                            <Button
                                                onClick={handleAddCompanySignature}
                                                disabled={processing || !tenant?.signature_url}
                                                className="w-full"
                                            >
                                                {processing ? 'Adding...' : 'Use Company Signature'}
                                            </Button>
                                            {!tenant?.signature_url && (
                                                <p className="text-sm text-muted-foreground text-center">
                                                    Please upload a company signature in{' '}
                                                    <Link href={route('companies.edit', tenant?.id)} className="text-primary underline">
                                                        Company Settings
                                                    </Link>
                                                </p>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
