
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Search, Ban, CheckCircle, Play, CalendarClock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { useState } from 'react';

export default function AdminSubscriptionsIndex({ subscriptions, filters }: { subscriptions: any, filters: any }) {
    const [extendDialog, setExtendDialog] = useState<any>(null);
    const [extendDate, setExtendDate] = useState('');

    const handleSearch = (term: string) => {
        router.get(route('admin.subscriptions.index'), { ...filters, search: term }, { preserveState: true, replace: true });
    };

    const handleStatusFilter = (status: string) => {
        router.get(route('admin.subscriptions.index'), { ...filters, status: status === 'all' ? '' : status }, { preserveState: true });
    };

    const cancelSubscription = (id: number) => {
        if (confirm('Are you sure you want to cancel this subscription?')) {
            router.delete(route('admin.subscriptions.destroy', id));
        }
    };

    const resumeSubscription = (id: number) => {
        if (confirm('Are you sure you want to resume this subscription?')) {
            router.post(route('admin.subscriptions.resume', id));
        }
    };

    const handleExtend = () => {
        if (extendDialog && extendDate) {
            router.post(route('admin.subscriptions.extend', extendDialog.id), {
                date: extendDate
            }, {
                onSuccess: () => {
                    setExtendDialog(null);
                    setExtendDate('');
                }
            });
        }
    };

    return (
        <AdminLayout header="Subscription Management">
            {/* ... */}
            <Head title="Admin - Subscriptions" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Subscription Management</h2>
                    <p className="text-muted-foreground">
                        Manage user subscriptions, plans, and billing cycles.
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search user..."
                                    className="pl-8"
                                    defaultValue={filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                            <Select
                                defaultValue={filters.status || 'all'}
                                onValueChange={handleStatusFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="trial">Trial</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Cycle</TableHead>
                                    <TableHead>Start/End</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subscriptions.data.length > 0 ? (
                                    subscriptions.data.map((sub: any) => (
                                        <TableRow key={sub.id}>
                                            <TableCell>
                                                <div className="font-medium">{sub.user?.name}</div>
                                                <div className="text-xs text-muted-foreground">{sub.user?.email}</div>
                                            </TableCell>
                                            <TableCell>{sub.plan?.name}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                                                        {sub.status}
                                                    </Badge>
                                                    {sub.on_trial && (
                                                        <span className="text-[10px] text-orange-600 font-semibold">On Trial</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize">{sub.billing_cycle}</TableCell>
                                            <TableCell>
                                                <div className="text-xs">
                                                    <div>Start: {sub.starts_at}</div>
                                                    <div>End: {sub.ends_at || '-'}</div>
                                                    {sub.trial_ends_at && <div className="text-orange-600">Trial Ends: {sub.trial_ends_at}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    {sub.status === 'active' && (
                                                        <>
                                                            <Button variant="ghost" size="icon" onClick={() => setExtendDialog(sub)} title="Extend Subscription">
                                                                <CalendarClock className="h-4 w-4 text-blue-600" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => cancelSubscription(sub.id)} title="Cancel Subscription">
                                                                <Ban className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {sub.status === 'cancelled' && (
                                                        <Button variant="ghost" size="icon" onClick={() => resumeSubscription(sub.id)} title="Resume Subscription">
                                                            <Play className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No subscriptions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {subscriptions.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {subscriptions.links.map((link: any, index: number) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!extendDialog} onOpenChange={() => setExtendDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Extend Subscription</DialogTitle>
                        <DialogDescription>
                            Set a new end date for {extendDialog?.user?.name}'s subscription.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">New End Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={extendDate}
                                onChange={(e) => setExtendDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExtendDialog(null)}>Cancel</Button>
                        <Button onClick={handleExtend} disabled={!extendDate}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
