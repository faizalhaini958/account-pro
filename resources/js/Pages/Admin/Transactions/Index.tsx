
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Search } from 'lucide-react';

export default function AdminTransactionsIndex({ transactions, filters }: { transactions: any, filters: any }) {

    const handleSearch = (term: string) => {
        router.get(route('admin.transactions.index'), { ...filters, search: term }, { preserveState: true, replace: true });
    };

    const handleFilter = (key: string, value: string) => {
        router.get(route('admin.transactions.index'), { ...filters, [key]: value === 'all' ? '' : value }, { preserveState: true });
    };

    return (
        <DashboardLayout header="Transaction Management">
            <Head title="Admin - Transactions" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Transactions</CardTitle>
                        <CardDescription>View and monitor all payment transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search ID, User, Email..."
                                    className="pl-8"
                                    defaultValue={filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                            <Select
                                defaultValue={filters.status || 'all'}
                                onValueChange={(val) => handleFilter('status', val)}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="success">Success</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                defaultValue={filters.gateway || 'all'}
                                onValueChange={(val) => handleFilter('gateway', val)}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Gateway" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Gateways</SelectItem>
                                    <SelectItem value="chip">Chip</SelectItem>
                                    <SelectItem value="kipple_pay">KipplePay</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Gateway</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((txn: any) => (
                                        <TableRow key={txn.id}>
                                            <TableCell className="font-mono text-xs">{txn.transaction_id}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{txn.user?.name}</div>
                                                <div className="text-xs text-muted-foreground">{txn.user?.email}</div>
                                            </TableCell>
                                            <TableCell>{txn.plan?.name}</TableCell>
                                            <TableCell>
                                                {txn.currency} {txn.amount}
                                            </TableCell>
                                            <TableCell className="uppercase text-xs font-semibold">{txn.gateway}</TableCell>
                                            <TableCell>
                                                <Badge variant={txn.status === 'success' ? 'outline' : 'secondary'} className={txn.status === 'success' ? 'text-green-600 border-green-600' : ''}>
                                                    {txn.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">
                                                {txn.created_at}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination would go here */}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
