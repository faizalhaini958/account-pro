import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { formatCurrency } from "@/lib/format"
import { format } from "date-fns"
import { Separator } from "@/Components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { ArrowLeft, Download } from "lucide-react"
import { Badge } from "@/Components/ui/badge"

interface Props {
    quotation: any
}

export default function Show({ quotation }: Props) {
    return (
        <DashboardLayout header={`Quotation ${quotation.number}`}>
            <Head title={`Quotation ${quotation.number}`} />

            <div className="max-w-4xl mx-auto py-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" asChild>
                        <Link href={route('sales.quotations.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Quotations
                        </Link>
                    </Button>
                    <div className="space-x-2">
                        <Button variant="outline" asChild>
                            <a href={route('sales.quotations.pdf', quotation.id)} target="_blank">
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
                                    <CardTitle>Quotation {quotation.number}</CardTitle>
                                    <CardDescription>
                                        Date: {format(new Date(quotation.date), "PPP")}
                                    </CardDescription>
                                </div>
                                <Badge variant={
                                    quotation.status === 'accepted' ? "default" :
                                        quotation.status === 'sent' ? "secondary" :
                                            quotation.status === 'draft' ? "outline" :
                                                "destructive"
                                } className="uppercase">
                                    {quotation.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Addresses */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Quote To</h4>
                                    <p className="font-medium">{quotation.customer.name}</p>
                                    <p className="text-sm whitespace-pre-line text-muted-foreground">
                                        {quotation.customer.address}
                                    </p>
                                    {quotation.customer.email && <p className="text-sm text-muted-foreground">{quotation.customer.email}</p>}
                                    {quotation.customer.phone && <p className="text-sm text-muted-foreground">{quotation.customer.phone}</p>}
                                </div>
                                <div className="text-right">
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Details</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-end gap-4">
                                            <span className="text-muted-foreground">Valid Until:</span>
                                            <span>{quotation.valid_until ? format(new Date(quotation.valid_until), "dd/MM/yyyy") : '-'}</span>
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
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quotation.items.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(parseFloat(item.unit_price))}</TableCell>
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
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>{formatCurrency(parseFloat(quotation.total))}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notes & Terms</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Notes</h4>
                                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                                    {quotation.notes || "No notes."}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Terms</h4>
                                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                                    {quotation.terms || "No specific terms."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
