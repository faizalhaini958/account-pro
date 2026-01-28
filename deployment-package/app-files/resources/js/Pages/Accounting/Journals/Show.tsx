import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link } from "@inertiajs/react"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Badge } from "@/Components/ui/badge"
import { formatCurrency } from "@/lib/format"
import { format } from "date-fns"
import { ArrowLeft, Printer } from "lucide-react"

interface Props {
    entry: any
}

export default function Show({ entry }: Props) {
    // Helper to calculate totals for verification
    const totalDebit = entry.lines
        .filter((l: any) => l.type === 'debit')
        .reduce((sum: number, l: any) => sum + parseFloat(l.amount), 0)

    const totalCredit = entry.lines
        .filter((l: any) => l.type === 'credit')
        .reduce((sum: number, l: any) => sum + parseFloat(l.amount), 0)

    return (
        <DashboardLayout header={`Journal Entry: ${entry.entry_number}`}>
            <Head title={`Journal ${entry.entry_number}`} />

            <div className="max-w-5xl mx-auto py-6 space-y-6">
                <div className="flex justify-between items-center print:hidden">
                    <Button variant="ghost" asChild>
                        <Link href={route('accounting.journals.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Journals
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Header Info */}
                    <Card className="md:col-span-3">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold">{entry.entry_number}</h2>
                                    <p className="text-muted-foreground">
                                        Posted on {format(new Date(entry.date), "PPP")}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <Badge variant={entry.status === 'posted' ? 'default' : 'secondary'} className="uppercase">
                                        {entry.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Reference</div>
                                    <div className="font-medium">{entry.reference_number || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">System Generated</div>
                                    <div className="font-medium">{entry.is_system_generated ? 'Yes' : 'No'}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-sm text-muted-foreground">Description</div>
                                    <div className="font-medium">{entry.description || '-'}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lines */}
                    <Card className="md:col-span-3">
                        <CardHeader>
                            <CardTitle>Transaction Lines</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Account Code</TableHead>
                                        <TableHead>Account Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Debit</TableHead>
                                        <TableHead className="text-right">Credit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entry.lines.map((line: any) => (
                                        <TableRow key={line.id}>
                                            <TableCell className="font-mono">{line.account.code}</TableCell>
                                            <TableCell>{line.account.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{line.description}</TableCell>
                                            <TableCell className="text-right">
                                                {line.type === 'debit' ? formatCurrency(parseFloat(line.amount)) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {line.type === 'credit' ? formatCurrency(parseFloat(line.amount)) : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Footer Row for Totals */}
                                    <TableRow className="font-bold bg-muted/50">
                                        <TableCell colSpan={3} className="text-right">Total</TableCell>
                                        <TableCell className="text-right">{formatCurrency(totalDebit)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(totalCredit)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .py-6, .py-6 * {
                        visibility: visible;
                    }
                    nav, header, aside, .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </DashboardLayout>
    )
}
