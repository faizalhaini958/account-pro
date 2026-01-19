
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react';

interface Gateway {
    code: string;
    name: string;
    description: string;
    is_sandbox: boolean;
}

interface Plan {
    id: number;
    name: string;
    code: string;
    price_monthly: string;
    price_yearly: string;
}

interface Subscription {
    billing_cycle: 'monthly' | 'yearly';
    status: string;
}

interface Props {
    plan: Plan;
    subscription: Subscription;
    gateways: Gateway[];
    billable_amount: number;
}

export default function CheckoutIndex({ plan, subscription, gateways, billable_amount }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        gateway: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('checkout.store'));
    };

    return (
        <DashboardLayout header="Checkout">
            <Head title="Checkout" />

            <div className="max-w-4xl mx-auto py-8">
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Order Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                                <CardDescription>Review your subscription details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-start pb-4 border-b">
                                    <div>
                                        <h3 className="font-semibold text-lg">{plan.name} Plan</h3>
                                        <p className="text-muted-foreground capitalize">{subscription.billing_cycle} billing</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-xl">RM {billable_amount}</div>
                                        <p className="text-xs text-muted-foreground">per {subscription.billing_cycle === 'monthly' ? 'month' : 'year'}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-2 font-medium">
                                    <span>Total Due Today</span>
                                    <span className="text-xl">RM {billable_amount}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/50 p-6">
                                <div className="flex gap-2 text-sm text-muted-foreground">
                                    <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                                    <span>Secure payment processing. Your subscription will start immediately after payment.</span>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Method</CardTitle>
                                <CardDescription>Select a payment gateway to proceed</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submit} id="payment-form">
                                    <RadioGroup
                                        value={data.gateway}
                                        onValueChange={(value) => setData('gateway', value)}
                                        className="grid gap-4"
                                    >
                                        {gateways.length > 0 ? (
                                            gateways.map((gateway) => (
                                                <div key={gateway.code}>
                                                    <RadioGroupItem
                                                        value={gateway.code}
                                                        id={gateway.code}
                                                        className="peer sr-only"
                                                    />
                                                    <Label
                                                        htmlFor={gateway.code}
                                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                                    >
                                                        <div className="flex w-full items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <CreditCard className="h-6 w-6" />
                                                                <div className="font-semibold">{gateway.name}</div>
                                                            </div>
                                                            {gateway.is_sandbox && (
                                                                <Badge variant="outline" className="text-xs">Test Mode</Badge>
                                                            )}
                                                        </div>
                                                        <div className="w-full text-left mt-2 text-sm text-muted-foreground">
                                                            {gateway.description}
                                                        </div>
                                                    </Label>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                                                No payment gateways configured. Please contact support.
                                            </div>
                                        )}
                                    </RadioGroup>
                                    {errors.gateway && (
                                        <p className="text-sm font-medium text-destructive mt-2">{errors.gateway}</p>
                                    )}
                                </form>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    size="lg"
                                    form="payment-form"
                                    disabled={processing || gateways.length === 0}
                                >
                                    {processing ? 'Processing...' : `Pay RM ${billable_amount}`}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
