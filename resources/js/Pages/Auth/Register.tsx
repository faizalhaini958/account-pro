import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Check, Building2, ArrowLeft } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { Container, Section } from '@/Components/landing/Layout';
import { ThemeToggle } from '@/Components/ThemeToggle';
import { LanguageSwitcher } from '@/Components/LanguageSwitcher';

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

interface RegisterProps {
    plans: SubscriptionPlan[];
    selectedPlan?: string;
}

export default function Register({ plans, selectedPlan }: RegisterProps) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        company_name: '',
        password: '',
        password_confirmation: '',
        plan_code: selectedPlan || plans.find(p => p.is_popular)?.code || plans[0]?.code || '',
        billing_cycle: 'yearly' as 'monthly' | 'yearly',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const selectedPlanData = plans.find(p => p.code === data.plan_code);
    const price = Number(data.billing_cycle === 'monthly'
        ? selectedPlanData?.price_monthly
        : selectedPlanData?.price_yearly) || 0;
    const savings = Number(selectedPlanData?.price_monthly) * 12 - Number(selectedPlanData?.price_yearly);

    return (
        <>
            <Head title={t('auth.register')} />

            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <Container>
                        <div className="flex h-11 items-center justify-between">
                            <Link href="/" className="flex items-center gap-2">
                                <Building2 className="h-6 w-6 text-primary" />
                                <span className="text-xl font-semibold">BukuKira</span>
                            </Link>
                            <div className="flex items-center gap-4">
                                <LanguageSwitcher />
                                <ThemeToggle />
                            </div>
                        </div>
                    </Container>
                </header>

                {/* Registration Form */}
                <Section className="py-12">
                    <Container>
                        <div className="max-w-4xl mx-auto">
                            {/* Back Button */}
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {t('common.back', 'Back to home')}
                            </Link>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-normal tracking-tight mb-2">
                                    {t('auth.createAccount', 'Create Your Account')}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t('auth.startJourney', 'Start your journey with BukuKira today')}
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-8">
                                {/* Plan Selection */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-normal">
                                            {t('landing.pricing.subtitle', 'Choose the plan that fits your needs')}
                                        </h2>

                                        {/* Billing Toggle */}
                                        <div className="inline-flex items-center rounded-lg border p-1 bg-muted/50">
                                            <button
                                                type="button"
                                                onClick={() => setData('billing_cycle', 'monthly')}
                                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                                    data.billing_cycle === 'monthly'
                                                        ? 'bg-background shadow-sm'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                {t('landing.pricing.monthly', 'Monthly')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('billing_cycle', 'yearly')}
                                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                                    data.billing_cycle === 'yearly'
                                                        ? 'bg-background shadow-sm'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                {t('landing.pricing.yearly', 'Yearly')}
                                                <Badge variant="secondary" className="ml-1.5 text-xs">
                                                    {t('landing.pricing.save', 'Save 20%')}
                                                </Badge>
                                            </button>
                                        </div>
                                    </div>

                                    <RadioGroup
                                        value={data.plan_code}
                                        onValueChange={(value) => setData('plan_code', value)}
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                                    >
                                        {plans.map((plan) => {
                                            const planPrice = Number(data.billing_cycle === 'monthly' ? plan.price_monthly : plan.price_yearly) || 0;
                                            const isSelected = data.plan_code === plan.code;

                                            return (
                                                <div key={plan.id} className="relative">
                                                    <RadioGroupItem
                                                        value={plan.code}
                                                        id={`plan-${plan.code}`}
                                                        className="peer sr-only"
                                                    />
                                                    {plan.is_popular && (
                                                        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                                                            Most Popular
                                                        </Badge>
                                                    )}
                                                    <Label
                                                        htmlFor={`plan-${plan.code}`}
                                                        className={`flex flex-col h-full rounded-lg border-2 p-6 cursor-pointer transition-all ${
                                                            isSelected
                                                                ? 'border-primary shadow-lg bg-accent/50'
                                                                : 'border-border hover:border-primary/50'
                                                        }`}
                                                    >
                                                        <div className="mb-4">
                                                            <div className="font-semibold text-lg mb-1">{plan.name}</div>
                                                            <div className="text-xs text-muted-foreground">{plan.description}</div>
                                                        </div>
                                                        <div className="mb-4">
                                                            {planPrice === 0 ? (
                                                                <span className="text-3xl font-semibold">Free</span>
                                                            ) : (
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-3xl font-semibold">
                                                                        RM {planPrice.toFixed(0)}
                                                                    </span>
                                                                    <span className="text-sm text-muted-foreground">
                                                                        /{data.billing_cycle === 'monthly' ? 'mo' : 'yr'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <ul className="text-sm space-y-2 flex-1">
                                                            {plan.features.slice(0, 4).map((feature, idx) => (
                                                                <li key={idx} className="flex items-start gap-2">
                                                                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                                    <span className="text-xs">{feature}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </RadioGroup>
                                    <InputError message={errors.plan_code} className="mt-2" />
                                </div>

                                {/* Account Details */}
                                <Card className="border-border/50">
                                    <CardContent className="pt-6 space-y-4">
                                        <h2 className="text-xl font-normal mb-4">
                                            {t('auth.accountDetails', 'Account Details')}
                                        </h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">{t('auth.name', 'Name')}</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    required
                                                    autoFocus
                                                    className="w-full"
                                                />
                                                <InputError message={errors.name} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="company_name">
                                                    {t('auth.companyName', 'Company Name')}
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        ({t('common.optional', 'Optional')})
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="company_name"
                                                    name="company_name"
                                                    value={data.company_name}
                                                    onChange={(e) => setData('company_name', e.target.value)}
                                                    placeholder={t('auth.companyNamePlaceholder', 'Leave blank to use your name')}
                                                    className="w-full"
                                                />
                                                <InputError message={errors.company_name} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">{t('auth.email', 'Email')}</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                                className="w-full"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="password">{t('auth.password', 'Password')}</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    required
                                                    className="w-full"
                                                />
                                                <InputError message={errors.password} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation">
                                                    {t('auth.confirmPassword', 'Confirm Password')}
                                                </Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    name="password_confirmation"
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    required
                                                    className="w-full"
                                                />
                                                <InputError message={errors.password_confirmation} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Submit Section */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                                    <p className="text-sm text-muted-foreground">
                                        {t('auth.alreadyRegistered', 'Already registered?')}{' '}
                                        <Link
                                            href={route('login')}
                                            className="text-primary hover:underline font-medium"
                                        >
                                            {t('auth.login', 'Log in')}
                                        </Link>
                                    </p>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={processing}
                                        className="w-full sm:w-auto"
                                    >
                                        {processing ? (
                                            t('common.loading', 'Loading...')
                                        ) : price === 0 ? (
                                            t('landing.pricing.signUpFree', 'Sign Up Free')
                                        ) : (
                                            `${t('auth.register', 'Register')} - RM ${price.toFixed(0)}/${data.billing_cycle === 'monthly' ? 'mo' : 'yr'}`
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Container>
                </Section>

                {/* Footer */}
                <footer className="border-t py-6">
                    <Container>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <Building2 className="h-6 w-6 text-primary" />
                                    <span className="text-xl font-semibold">BukuKira</span>
                                </div>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    {t('landing.footer.tagline')}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-3">{t('landing.footer.product')}</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>
                                        <Link href="/" className="hover:text-foreground transition-colors">
                                            {t('landing.footer.features')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/" className="hover:text-foreground transition-colors">
                                            {t('landing.footer.pricing')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('login')}
                                            className="hover:text-foreground transition-colors"
                                        >
                                            {t('landing.loginSignup')}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-3">{t('landing.footer.company')}</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>
                                        <Link
                                            href={route('about')}
                                            className="hover:text-foreground transition-colors"
                                        >
                                            {t('landing.footer.about')}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                            <div className="col-span-1 md:col-span-2"></div>
                            <div className="md:col-span-2">
                                <h3 className="font-semibold mb-3">{t('landing.footer.legal')}</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>
                                        <Link
                                            href={route('privacy')}
                                            className="hover:text-foreground transition-colors"
                                        >
                                            {t('landing.footer.privacy')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('terms')}
                                            className="hover:text-foreground transition-colors"
                                        >
                                            {t('landing.footer.terms')}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-sm text-muted-foreground">
                                {t('landing.footer.copyright', { year: new Date().getFullYear() })}
                            </p>
                            <div className="flex gap-4">
                                <ThemeToggle />
                            </div>
                        </div>
                    </Container>
                </footer>
            </div>
        </>
    );
}
