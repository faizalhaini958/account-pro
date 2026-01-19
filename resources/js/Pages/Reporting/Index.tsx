import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link } from "@inertiajs/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/Components/ui/card"
import { BarChart3, Package, TrendingUp } from "lucide-react"

export default function Index() {
    const reports = [
        {
            title: "Sales Report",
            description: "View sales performance, tax summary, and daily trends.",
            icon: TrendingUp,
            href: route('reporting.sales'),
            color: "text-green-600",
            bgColor: "bg-green-100"
        },
        {
            title: "Stock Valuation",
            description: "Current inventory levels, valuation, and potential revenue.",
            icon: Package,
            href: route('reporting.stock'),
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        // Placeholder for future Financial Reports (P&L, Balance Sheet) which would need real GL aggregation
        // {
        //     title: "Profit & Loss",
        //     description: "Financial performance over a specific period.",
        //     icon: BarChart3,
        //     href: "#",
        //     color: "text-purple-600",
        //     bgColor: "bg-purple-100"
        // }
    ]

    return (
        <DashboardLayout header="Reports">
            <Head title="Reports" />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.map((report) => (
                        <Link key={report.title} href={report.href}>
                            <Card className="hover:bg-muted/50 transition-colors h-full">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <div className={`p-3 rounded-full ${report.bgColor}`}>
                                        <report.icon className={`h-6 w-6 ${report.color}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle>{report.title}</CardTitle>
                                        <CardDescription>{report.description}</CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}
