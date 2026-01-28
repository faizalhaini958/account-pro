import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Building2, MoreHorizontal, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface Company {
    id: number;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    is_active: boolean;
    is_current: boolean;
    role: string;
    users_count: number;
    created_at: string;
}

interface CompaniesIndexProps {
    companies: Company[];
}

export default function CompaniesIndex({ companies }: CompaniesIndexProps) {
    const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

    const handleDelete = () => {
        if (companyToDelete) {
            router.delete(route('companies.destroy', companyToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setCompanyToDelete(null);
                },
            });
        }
    };

    return (
        <DashboardLayout>
            <Head title="Manage Companies" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">My Companies</h2>
                        <p className="text-muted-foreground">
                            Manage all companies you have access to
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Companies</CardTitle>
                        <CardDescription>
                            You have access to {companies.length} {companies.length === 1 ? 'company' : 'companies'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Your Role</TableHead>
                                    <TableHead>Users</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {companies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                                            No companies found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    companies.map((company) => (
                                        <TableRow key={company.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    {company.name}
                                                    {company.is_current && (
                                                        <Badge variant="default" className="ml-2">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Active
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{company.email || '-'}</TableCell>
                                            <TableCell>{company.phone || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{company.role}</Badge>
                                            </TableCell>
                                            <TableCell>{company.users_count}</TableCell>
                                            <TableCell>
                                                {company.is_active ? (
                                                    <Badge variant="default">Active</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{company.created_at}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('companies.edit', company.id)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            disabled={company.is_current || companies.length === 1}
                                                            onClick={() => setCompanyToDelete(company)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!companyToDelete} onOpenChange={() => setCompanyToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Company</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{companyToDelete?.name}"? This action cannot be undone.
                            All data associated with this company will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCompanyToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
