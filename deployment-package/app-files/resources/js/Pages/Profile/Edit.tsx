import DashboardLayout from '@/Layouts/DashboardLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react'; // Import useForm and router
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { useTranslation } from 'react-i18next';

import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Download, CreditCard, User, AlertTriangle, Check } from 'lucide-react'; // Import icons
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter, // Import DialogFooter
} from "@/Components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";
import { useState } from 'react'; // Import useState

export default function Edit({
    mustVerifyEmail,
    status,
    subscription,
    transactions,
    availablePlans,
}: PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
    subscription?: any;
    transactions?: any;
    availablePlans?: any[];
}>) {
    const { t } = useTranslation();
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [changePlanModalOpen, setChangePlanModalOpen] = useState(false);

    // Form for cancellation (if needed for post request)
    // Actually, simple router.delete or router.post is enough for cancel
    const handleCancelSubscription = () => {
        router.delete(route('subscription.cancel'), {
            onSuccess: () => setCancelModalOpen(false),
        });
    };

    const [downgradePlan, setDowngradePlan] = useState<any>(null); // State to store the plan being downgraded to

    const handlePlanSelect = (plan: any) => {
        // Simple logic: if new plan price is less than current plan price, it's a downgrade
        // This assumes monthly price comparison is sufficient
        const currentPrice = subscription.billing_cycle === 'monthly' ? subscription.plan?.price_monthly : subscription.plan?.price_yearly;
        const newPrice = subscription.billing_cycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
        // Adjust comparison if cycles might differ, but for now assuming same cycle switch or simple monthly price comparison as proxy for tier

        // Better proxy: compare ids or sort_order if available, or just price_monthly
        const isDowngrade = Number(plan.price_monthly) < Number(subscription.plan?.price_monthly);

        if (isDowngrade) {
            setDowngradePlan(plan);
        } else {
            // Use window.location as fallback if router.visit has issues, but router.visit is standard
            router.visit(route('checkout.index', { plan_id: plan.id }));
        }
    };

    const confirmDowngrade = () => {
        if (downgradePlan) {
            router.visit(route('checkout.index', { plan_id: downgradePlan.id }));
        }
    };

    return (
        <DashboardLayout header={t('profile.title')}>
            <Head title={t('profile.title')} />

            <div className="py-6">
                <Tabs defaultValue="profile" className="w-full space-y-6">
                    <TabsList>
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="billing" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Subscription & Billing
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2 group items-start">
                            <div className="bg-card border p-4 shadow-sm sm:rounded-lg">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="w-full"
                                />
                            </div>

                            <div className="bg-card border p-4 shadow-sm sm:rounded-lg">
                                <UpdatePasswordForm className="w-full" />
                            </div>
                        </div>

                        <div className="bg-card border p-4 shadow-sm sm:rounded-lg border-destructive/20">
                            <DeleteUserForm className="w-full" />
                        </div>
                    </TabsContent>

                    <TabsContent value="billing">
                        {/* Subscription Management */}
                        <div className="bg-card border shadow-sm sm:rounded-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Subscription & Billing
                                </CardTitle>
                                <CardDescription>Manage your plan and view billing history.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Current Plan */}
                                {subscription ? (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4 border rounded-md bg-muted/20">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                                            <p className="text-lg font-bold">{subscription.plan?.name || 'Unknown Plan'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                                            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                                                {subscription.status}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Next Billing Date</p>
                                            <p className="font-medium">{new Date(subscription.ends_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                            <p className="font-medium">
                                                RM {subscription.billing_cycle === 'monthly' ? subscription.plan?.price_monthly : subscription.plan?.price_yearly}
                                                <span className="text-xs text-muted-foreground">/{subscription.billing_cycle}</span>
                                            </p>
                                        </div>
                                        <div className="col-span-full flex gap-2 pt-2">
                                            {subscription.status === 'cancelled' && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => router.visit(route('checkout.index'))}
                                                >
                                                    Reactivate Subscription
                                                </Button>
                                            )}
                                            {subscription.status === 'active' && (
                                                <>
                                                    <AlertDialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">Cancel Subscription</Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will cancel your current subscription effective immediately, and you will lose access to premium features at the end of your billing cycle.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                                                <AlertDialogAction onClick={handleCancelSubscription} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                    Yes, Cancel Subscription
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    <Dialog open={changePlanModalOpen} onOpenChange={setChangePlanModalOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">Change Plan</Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-3xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Change Subscription Plan</DialogTitle>
                                                                <DialogDescription>
                                                                    Choose a new plan to upgrade or downgrade your subscription.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4 md:grid-cols-3">
                                                                {availablePlans?.filter(plan => plan.id !== subscription.plan_id).map((plan) => (
                                                                    <div key={plan.id} className="border rounded-lg p-4 flex flex-col justify-between">
                                                                        <div>
                                                                            <h3 className="font-bold text-lg">{plan.name}</h3>
                                                                            <p className="text-2xl font-bold mt-2">RM {plan.price_monthly}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                                                                            <div className="mt-4 space-y-2">
                                                                                {plan.features && plan.features.slice(0, 3).map((feature: string, i: number) => (
                                                                                    <div key={i} className="flex items-center text-sm text-muted-foreground">
                                                                                        <Check className="h-4 w-4 mr-2 text-primary" />
                                                                                        {feature}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <div className="mt-6">
                                                                            <Button className="w-full" onClick={() => handlePlanSelect(plan)}>Select Plan</Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {availablePlans?.filter(plan => plan.id !== subscription.plan_id).length === 0 && (
                                                                    <div className="col-span-3 text-center py-8 text-muted-foreground">
                                                                        No other plans available.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>

                                                    <AlertDialog open={!!downgradePlan} onOpenChange={(open) => !open && setDowngradePlan(null)}>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                                                                    <AlertTriangle className="h-5 w-5" />
                                                                    Downgrade Warning
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    You are about to downgrade to the <strong>{downgradePlan?.name}</strong> plan.
                                                                    <br /><br />
                                                                    Please note that you may lose access to certain premium features associated with your current plan immediately or at the end of the billing cycle.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={confirmDowngrade} className="bg-amber-600 hover:bg-amber-700 text-white">
                                                                    Confirm Downgrade
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 border rounded-md border-dashed">
                                        <p className="text-muted-foreground mb-4">You do not have an active subscription.</p>
                                        <Link href={route('checkout.index')}>
                                            <Button>View Plans</Button>
                                        </Link>
                                    </div>
                                )}

                                {/* Transactions Table */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Billing History</h3>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Gateway</TableHead>
                                                    <TableHead className="text-right">Receipt</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {transactions && transactions.data.length > 0 ? (
                                                    transactions.data.map((transaction: any) => (
                                                        <TableRow key={transaction.id}>
                                                            <TableCell>{transaction.date}</TableCell>
                                                            <TableCell>{transaction.currency} {transaction.amount}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={transaction.status === 'success' ? 'outline' : 'secondary'} className={transaction.status === 'success' ? 'text-green-600 border-green-600' : ''}>
                                                                    {transaction.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="uppercase">{transaction.gateway}</TableCell>
                                                            <TableCell className="text-right">
                                                                {transaction.status === 'success' && (
                                                                    <a href={transaction.invoice_url} target="_blank" rel="noopener noreferrer">
                                                                        <Button variant="ghost" size="icon">
                                                                            <Download className="h-4 w-4" />
                                                                        </Button>
                                                                    </a>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                            No payment history found.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </CardContent>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
