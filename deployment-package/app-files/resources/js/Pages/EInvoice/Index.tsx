import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, router } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { StatCard } from "@/Components/StatCard"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table"
import { FileText, CheckCircle, Clock, XCircle, AlertCircle, Settings } from "lucide-react"

interface EInvoiceDocument {
    id: number
    uuid: string | null
    status: string
    invoice: {
        reference_number: string
        customer: {
            name: string
        }
        date: string
        total: number
    }
    submitted_at: string | null
    validated_at: string | null
}

interface EInvoiceIndexProps {
    documents: {
        data: EInvoiceDocument[]
        current_page: number
        last_page: number
    }
    stats: {
        total: number
        prepared: number
        submitted: number
        validated: number
        rejected: number
    }
    filters: {
        status?: string
        start_date?: string
        end_date?: string
    }
    isConfigured: boolean
}

export default function EInvoiceIndex({ documents, stats, filters, isConfigured }: EInvoiceIndexProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR',
        }).format(amount)
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; icon: any }> = {
            not_prepared: { variant: 'secondary', icon: AlertCircle },
            prepared: { variant: 'default', icon: FileText },
            submitted: { variant: 'default', icon: Clock },
            validated: { variant: 'default', icon: CheckCircle },
            rejected: { variant: 'destructive', icon: XCircle },
            cancelled: { variant: 'secondary', icon: XCircle },
        }

        const config = variants[status] || variants.not_prepared
        const Icon = config.icon

        return (
            <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                <Icon className="h-3 w-3" />
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        )
    }

    const handleBatchSubmit = () => {
        // TODO: Implement batch selection
        alert('Batch submit feature coming soon')
    }

    return (
        <DashboardLayout header="e-Invoice Center">
            <Head title="e-Invoice Center" />

            <div className="p-6 space-y-6">
                {/* Configuration Warning */}
                {!isConfigured && (
                    <Card className="border-orange-200 bg-orange-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                                <div>
                                    <p className="font-semibold text-orange-900">e-Invoice not configured</p>
                                    <p className="text-sm text-orange-700">
                                        Please configure your MyInvois credentials in{' '}
                                        <Link href={route('einvoice.settings')} className="underline">
                                            settings
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">e-Invoice Center</h2>
                        <p className="text-muted-foreground">Manage LHDN e-Invoice submissions</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleBatchSubmit}>
                            Batch Submit
                        </Button>
                        <Link href={route('einvoice.settings')}>
                            <Button variant="outline">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-5">
                    <StatCard
                        title="Total Documents"
                        value={stats.total}
                        icon={FileText}
                    />
                    <StatCard
                        title="Prepared"
                        value={stats.prepared}
                        icon={FileText}
                        className="border-blue-200"
                    />
                    <StatCard
                        title="Submitted"
                        value={stats.submitted}
                        icon={Clock}
                        className="border-yellow-200"
                    />
                    <StatCard
                        title="Validated"
                        value={stats.validated}
                        icon={CheckCircle}
                        className="border-green-200"
                    />
                    <StatCard
                        title="Rejected"
                        value={stats.rejected}
                        icon={XCircle}
                        className="border-red-200"
                    />
                </div>

                {/* Documents Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>e-Invoice Documents</CardTitle>
                        <CardDescription>All e-Invoice submissions and their status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>UUID</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            No e-Invoice documents found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    documents.data.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-medium">
                                                {doc.invoice.reference_number}
                                            </TableCell>
                                            <TableCell>{doc.invoice.customer.name}</TableCell>
                                            <TableCell>{doc.invoice.date}</TableCell>
                                            <TableCell>{formatCurrency(doc.invoice.total)}</TableCell>
                                            <TableCell>{getStatusBadge(doc.status)}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {doc.uuid ? doc.uuid.substring(0, 8) + '...' : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Link href={route('einvoice.show', doc.id)}>
                                                    <Button variant="ghost" size="sm">
                                                        View
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
