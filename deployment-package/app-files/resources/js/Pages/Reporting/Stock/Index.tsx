import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, router } from "@inertiajs/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { formatCurrency } from "@/lib/format"
import { Printer } from "lucide-react"

interface Props {
    products: any[]
    summary: {
        total_items: number
        total_value: number
        total_potential_revenue: number
        low_stock_count: number
    }
}

export default function StockReport({ products, summary }: Props) {

    const handlePrint = () => {
        window.print()
    }

    return (
        <DashboardLayout header="Stock Valuation Report">
            <Head title="Stock Report" />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex justify-end print:hidden">
                    <Button onClick={handlePrint} variant="outline">
                        <Printer className="h-4 w-4 mr-2" /> Print Report
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Asset Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.total_value)}</div>
                            <p className="text-xs text-muted-foreground">Total Cost Basis</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Potential Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.total_potential_revenue)}</div>
                            <p className="text-xs text-muted-foreground">Retail Value</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_items}</div>
                            {summary.low_stock_count > 0 && (
                                <p className="text-xs text-red-500 font-medium">{summary.low_stock_count} Items Low Stock</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code / SKU</TableHead>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead className="text-right">Stock On Hand</TableHead>
                                    <TableHead className="text-right">Avg Cost</TableHead>
                                    <TableHead className="text-right">Total Value</TableHead>
                                    <TableHead className="text-right">Retail Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.code}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{product.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className={`text-right ${product.current_stock <= 10 ? 'text-red-600 font-bold' : ''}`}>
                                            {product.current_stock}
                                        </TableCell>
                                        <TableCell className="text-right">{formatCurrency(parseFloat(product.purchase_cost))}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(product.stock_value)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(parseFloat(product.retail_price))}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
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
