import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Check, ArrowRight, Building2, Shield, Zap, Users, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { useState, FormEventHandler } from 'react';

interface SubscriptionPlan {
    id: number;
    code: string;
    name: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    features: string[];
    is_popular?: boolean;
}

interface LandingProps {
    canLogin: boolean;
    canRegister: boolean;
    plans: SubscriptionPlan[];
}

export default function Landing({ canLogin, canRegister, plans }: LandingProps) {
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('');

    const loginForm = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const registerForm = useForm({
        name: '',
        email: '',
        company_name: '',
        password: '',
        password_confirmation: '',
        plan_code: '',
        billing_cycle: 'monthly' as 'monthly' | 'yearly',
    });

    const handleLogin: FormEventHandler = (e) => {
        e.preventDefault();
        loginForm.post(route('login'), {
            onSuccess: () => setLoginOpen(false),
        });
    };

    const handleRegister: FormEventHandler = (e) => {
        e.preventDefault();
        registerForm.post(route('register'), {
            onSuccess: () => setRegisterOpen(false),
        });
    };

    const openRegisterWithPlan = (planCode: string) => {
        setSelectedPlan(planCode);
        registerForm.setData('plan_code', planCode);
        setRegisterOpen(true);
    };

    return (
        <>
            <Head title="Welcome to BukuKira" />

            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-8 w-8 text-primary" />
                            <span className="text-2xl font-bold">BukuKira</span>
                        </div>
                        <div className="flex gap-4">
                            {canLogin && (
                                <Button variant="ghost" onClick={() => setLoginOpen(true)}>Login</Button>
                            )}
                            {canRegister && (
                                <Button onClick={() => setRegisterOpen(true)}>Get Started</Button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Professional Accounting
                        <span className="block text-primary mt-2">Made Simple</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Streamline your business finances with our comprehensive accounting solution.
                        Manage invoices, expenses, inventory, and more - all in one place.
                    </p>
                    <div className="flex gap-4 justify-center">
                        {canRegister && (
                            <Button size="lg" className="gap-2" onClick={() => setRegisterOpen(true)}>
                                Start Free Trial <ArrowRight className="h-4 w-4" />
                            </Button>
                        )}
                        <Button size="lg" variant="outline">
                            Watch Demo
                        </Button>
                    </div>
                </section>

                {/* Features Section */}
                <section className="container mx-auto px-4 py-20">
                    <div className="grid md:grid-cols-3 gap-8 mb-20">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Secure & Compliant</h3>
                            <p className="text-muted-foreground">
                                Bank-level security with e-Invoice integration for Malaysian businesses
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                                <Zap className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                            <p className="text-muted-foreground">
                                Modern interface built for speed and efficiency
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Multi-Company</h3>
                            <p className="text-muted-foreground">
                                Manage multiple companies from a single account
                            </p>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section className="container mx-auto px-4 py-20">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
                        <p className="text-xl text-muted-foreground">
                            Select the perfect plan for your business needs
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={plan.is_popular ? 'border-primary shadow-lg relative' : ''}
                            >
                                {plan.is_popular && (
                                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        Most Popular
                                    </Badge>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold">
                                                RM {plan.price_monthly}
                                            </span>
                                            <span className="text-muted-foreground">/month</span>
                                        </div>
                                        {plan.price_yearly > 0 && (
                                            <div className="text-sm text-muted-foreground mt-1">
                                                RM {plan.price_yearly}/year (Save {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)
                                            </div>
                                        )}
                                    </div>

                                    <ul className="space-y-3">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    {canRegister ? (
                                        <Button
                                            className="w-full"
                                            variant={plan.is_popular ? 'default' : 'outline'}
                                            onClick={() => openRegisterWithPlan(plan.code)}
                                        >
                                            Get Started
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            variant={plan.is_popular ? 'default' : 'outline'}
                                            disabled
                                        >
                                            Get Started
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t mt-20">
                    <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
                        <p>© 2026 BukuKira. All rights reserved.</p>
                    </div>
                </footer>
            </div>

            {/* Login Modal */}
            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Welcome Back</DialogTitle>
                        <DialogDescription>
                            Sign in to your BukuKira account
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <Label htmlFor="login-email">Email</Label>
                            <Input
                                id="login-email"
                                type="email"
                                value={loginForm.data.email}
                                onChange={(e) => loginForm.setData('email', e.target.value)}
                                required
                                className="mt-1"
                            />
                            {loginForm.errors.email && (
                                <p className="text-sm text-destructive mt-1">{loginForm.errors.email}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="login-password">Password</Label>
                            <Input
                                id="login-password"
                                type="password"
                                value={loginForm.data.password}
                                onChange={(e) => loginForm.setData('password', e.target.value)}
                                required
                                className="mt-1"
                            />
                            {loginForm.errors.password && (
                                <p className="text-sm text-destructive mt-1">{loginForm.errors.password}</p>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={loginForm.data.remember}
                                onCheckedChange={(checked) => loginForm.setData('remember', checked as boolean)}
                            />
                            <Label htmlFor="remember" className="font-normal">Remember me</Label>
                        </div>
                        <Button type="submit" className="w-full" disabled={loginForm.processing}>
                            {loginForm.processing ? 'Signing in...' : 'Sign In'}
                        </Button>
                        <div className="text-center text-sm">
                            <button
                                type="button"
                                onClick={() => {
                                    setLoginOpen(false);
                                    setRegisterOpen(true);
                                }}
                                className="text-primary hover:underline"
                            >
                                Don't have an account? Sign up
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Register Modal */}
            <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Create Your Account</DialogTitle>
                        <DialogDescription>
                            Start your journey with BukuKira today
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Plan Selection */}
                        <div>
                            <Label className="text-sm font-semibold">Select Your Plan</Label>
                            <RadioGroup
                                value={registerForm.data.plan_code}
                                onValueChange={(value) => registerForm.setData('plan_code', value)}
                                className="grid grid-cols-2 gap-3 mt-2"
                            >
                                {plans.map((plan) => (
                                    <div key={plan.id}>
                                        <RadioGroupItem
                                            value={plan.code}
                                            id={`modal-plan-${plan.code}`}
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor={`modal-plan-${plan.code}`}
                                            className="flex flex-col gap-2 rounded-lg border-2 bg-gray-900 text-white p-3 cursor-pointer peer-data-[state=checked]:border-primary hover:bg-gray-800 transition-all"
                                        >
                                            <div className="font-semibold text-sm">{plan.name}</div>
                                            <div className="text-xl font-bold">RM {plan.price_monthly}<span className="text-xs text-gray-400">/mo</span></div>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Billing Cycle */}
                        <div>
                            <Label className="text-sm font-semibold">Billing Cycle</Label>
                            <RadioGroup
                                value={registerForm.data.billing_cycle}
                                onValueChange={(value) => registerForm.setData('billing_cycle', value as 'monthly' | 'yearly')}
                                className="flex gap-4 mt-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="monthly" id="modal-monthly" />
                                    <Label htmlFor="modal-monthly" className="font-normal cursor-pointer">Monthly</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yearly" id="modal-yearly" />
                                    <Label htmlFor="modal-yearly" className="font-normal cursor-pointer">
                                        Yearly <Badge variant="secondary" className="ml-1 text-xs">Save 17%</Badge>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="border-t pt-4">
                            <Label className="text-sm font-semibold">Account Details</Label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={registerForm.data.name}
                                    onChange={(e) => registerForm.setData('name', e.target.value)}
                                    required
                                    className="mt-1"
                                />
                                {registerForm.errors.name && (
                                    <p className="text-sm text-destructive mt-1">{registerForm.errors.name}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="company_name">Company Name (Optional)</Label>
                                <Input
                                    id="company_name"
                                    value={registerForm.data.company_name}
                                    onChange={(e) => registerForm.setData('company_name', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="reg-email">Email</Label>
                            <Input
                                id="reg-email"
                                type="email"
                                value={registerForm.data.email}
                                onChange={(e) => registerForm.setData('email', e.target.value)}
                                required
                                className="mt-1"
                            />
                            {registerForm.errors.email && (
                                <p className="text-sm text-destructive mt-1">{registerForm.errors.email}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={registerForm.data.password}
                                    onChange={(e) => registerForm.setData('password', e.target.value)}
                                    required
                                    className="mt-1"
                                />
                                {registerForm.errors.password && (
                                    <p className="text-sm text-destructive mt-1">{registerForm.errors.password}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={registerForm.data.password_confirmation}
                                    onChange={(e) => registerForm.setData('password_confirmation', e.target.value)}
                                    required
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={registerForm.processing}>
                            {registerForm.processing ? 'Creating account...' : 'Create Account'}
                        </Button>

                        <div className="text-center text-sm">
                            <button
                                type="button"
                                onClick={() => {
                                    setRegisterOpen(false);
                                    setLoginOpen(true);
                                }}
                                className="text-primary hover:underline"
                            >
                                Already have an account? Sign in
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
