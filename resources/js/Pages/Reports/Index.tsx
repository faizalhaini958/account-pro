import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { FileText, TrendingUp, Scale, Clock, DollarSign } from "lucide-react"

export default function ReportsIndex() {
    const reports = [
        {
            name: "Profit & Loss",
            description: "Income and expenses for a period",
            icon: TrendingUp,
            href: route('reports.profit-and-loss'),
            color: "text-green-600",
        },
        {
            name: "Balance Sheet",
            description: "Assets, liabilities, and equity",
            icon: Scale,
            href: route('reports.balance-sheet'),
            color: "text-blue-600",
        },
        {
            name: "Trial Balance",
            description: "All account balances",
            icon: FileText,
            href: route('reports.trial-balance'),
            color: "text-purple-600",
        },
        {
            name: "AR Aging",
            description: "Accounts receivable aging report",
            icon: Clock,
            href: route('reports.ar-aging'),
            color: "text-orange-600",
        },
    ]

    return (
        <DashboardLayout header="Financial Reports">
            <Head title="Financial Reports" />

            <div className="p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">Financial Reports</h2>
                    <p className="text-muted-foreground">
                        View and export your financial reports
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {reports.map((report) => {
                        const Icon = report.icon
                        return (
                            <Link key={report.name} href={report.href}>
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{report.name}</CardTitle>
                                            <Icon className={`h-5 w-5 ${report.color}`} />
                                        </div>
                                        <CardDescription>{report.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </DashboardLayout>
    )
}
