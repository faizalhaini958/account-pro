import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { ThemeToggle } from '@/Components/ThemeToggle';
import { LanguageSwitcher } from '@/Components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import {
    FileText,
    TrendingUp,
    Shield,
    Zap,
    DollarSign,
    Users,
    Check,
    Building2,
    Github,
    ArrowRight,
    BookOpen,
    Package,
    Handshake,
    Bell,
    BarChart,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Container, Section } from '@/Components/landing/Layout';

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

interface HomeProps {
    canLogin: boolean;
    canRegister: boolean;
    plans: SubscriptionPlan[];
}

export default function Home({ canLogin, canRegister, plans }: HomeProps) {
    const { t } = useTranslation();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

    useEffect(() => {
        // Optional: You can add theme detection logic here if needed
    }, []);

    const features = [
        {
            icon: FileText,
            titleKey: 'landing.features.invoice.title',
            descKey: 'landing.features.invoice.desc',
        },
        {
            icon: Shield,
            titleKey: 'landing.features.compliance.title',
            descKey: 'landing.features.compliance.desc',
        },
        {
            icon: Zap,
            titleKey: 'landing.features.tracking.title',
            descKey: 'landing.features.tracking.desc',
        },
        {
            icon: TrendingUp,
            titleKey: 'landing.features.analytics.title',
            descKey: 'landing.features.analytics.desc',
        },
        {
            icon: DollarSign,
            titleKey: 'landing.features.payment.title',
            descKey: 'landing.features.payment.desc',
        },
        {
            icon: Users,
            titleKey: 'landing.features.multicompany.title',
            descKey: 'landing.features.multicompany.desc',
        },
    ];

    const roadmapFeatures = [
        {
            icon: Package,
            titleKey: 'landing.roadmap.inventory.title',
            descKey: 'landing.roadmap.inventory.desc',
        },
        {
            icon: Handshake,
            titleKey: 'landing.roadmap.crm.title',
            descKey: 'landing.roadmap.crm.desc',
        },
        {
            icon: Bell,
            titleKey: 'landing.roadmap.notifications.title',
            descKey: 'landing.roadmap.notifications.desc',
        },
        {
            icon: BarChart,
            titleKey: 'landing.roadmap.reporting.title',
            descKey: 'landing.roadmap.reporting.desc',
        },
    ];

    return (
        <>
            <Head title="BukuKira - Professional Accounting Made Simple" />

            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <Container>
                        <div className="flex h-11 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-6 w-6 text-primary" />
                                <span className="text-xl font-semibold">BukuKira</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <LanguageSwitcher />
                                <ThemeToggle />
                                {canLogin && (
                                    <Button variant="ghost" asChild>
                                        <Link href={route('login')}>{t('landing.loginSignup')}</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Container>
                </header>

                {/* Hero Section */}
                <Section className="pt-20 pb-16">
                    <Container>
                        <div className="text-center max-w-3xl mx-auto">
                            <h1 className="text-4xl font-normal tracking-tight sm:text-6xl mb-6">
                                {t('landing.hero.title')}{' '}
                                <span className="text-primary">{t('landing.hero.titleHighlight')}</span>.
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                                {t('landing.hero.description')}{' '}
                                <span className="text-foreground font-medium">{t('landing.hero.descHighlight1')}</span> {t('landing.hero.description').toLowerCase() === 'bukukira is' ? 'with' : 'dengan'}{' '}
                                <span className="text-foreground font-medium">{t('landing.hero.descHighlight2')}</span> {t('landing.hero.descRest')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                {canRegister && (
                                    <Button size="lg" asChild>
                                        <Link href={route('register')}>{t('landing.hero.getStarted')}</Link>
                                    </Button>
                                )}
                                <Button size="lg" variant="outline" asChild>
                                    <a href="#pricing">{t('landing.hero.seePricing')}</a>
                                </Button>
                            </div>
                            {/* Dashboard Preview - showing your actual dashboard */}
                            <div className="mt-16 relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none h-32 bottom-0" />
                                <div className="relative rounded-xl border-2 shadow-2xl overflow-hidden bg-background">
                                    {/* Light mode dashboard */}
                                    <div className="block dark:hidden">
                                        <div className="bg-white p-6 rounded-lg">
                                            <div className="flex items-center justify-between mb-6 pb-4 border-b">
                                                <h2 className="text-2xl font-semibold">Welcome back!</h2>
                                                <div className="flex gap-2 items-center">
                                                    <button className="p-2 rounded-lg border hover:bg-gray-50">
                                                        ☀️
                                                    </button>
                                                    <span className="text-sm">English</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4 mb-6">
                                                <div className="p-4 bg-white border rounded-lg">
                                                    <div className="text-sm text-gray-500 mb-1">Sales Today</div>
                                                    <div className="text-2xl font-bold">RM 24,991.04</div>
                                                </div>
                                                <div className="p-4 bg-white border rounded-lg">
                                                    <div className="text-sm text-gray-500 mb-1">Accounts Receivable</div>
                                                    <div className="text-2xl font-bold">RM 45,322.29</div>
                                                </div>
                                                <div className="p-4 bg-white border rounded-lg">
                                                    <div className="text-sm text-gray-500 mb-1">Accounts Payable</div>
                                                    <div className="text-2xl font-bold">RM 88,179.00</div>
                                                </div>
                                                <div className="p-4 bg-white border rounded-lg">
                                                    <div className="text-sm text-gray-500 mb-1">Low Stock Items</div>
                                                    <div className="text-2xl font-bold">0</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dark mode dashboard */}
                                    <div className="hidden dark:block">
                                        <div className="bg-[#0a0a0a] p-6 rounded-lg">
                                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                                                <h2 className="text-2xl font-semibold text-white">Welcome back!</h2>
                                                <div className="flex gap-2 items-center">
                                                    <button className="p-2 rounded-lg border border-gray-800 hover:bg-gray-900">
                                                        🌙
                                                    </button>
                                                    <span className="text-sm text-gray-400">English</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4 mb-6">
                                                <div className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg">
                                                    <div className="text-sm text-gray-400 mb-1">Sales Today</div>
                                                    <div className="text-2xl font-bold text-white">RM 24,991.04</div>
                                                </div>
                                                <div className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg">
                                                    <div className="text-sm text-gray-400 mb-1">Accounts Receivable</div>
                                                    <div className="text-2xl font-bold text-white">RM 45,322.29</div>
                                                </div>
                                                <div className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg">
                                                    <div className="text-sm text-gray-400 mb-1">Accounts Payable</div>
                                                    <div className="text-2xl font-bold text-white">RM 88,179.00</div>
                                                </div>
                                                <div className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg">
                                                    <div className="text-sm text-gray-400 mb-1">Low Stock Items</div>
                                                    <div className="text-2xl font-bold text-white">0</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Container>
                </Section>

                {/* Features Section */}
                <Section id="features" className="bg-muted/50">
                    <Container>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-normal tracking-tight sm:text-4xl mb-4">
                                {t('landing.features.title')}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => (
                                <Card key={index} className="border-border/50">
                                    <CardHeader>
                                        <feature.icon className="h-8 w-8 text-primary mb-2" />
                                        <CardTitle className="text-xl font-normal">{t(feature.titleKey)}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-base">
                                            {t(feature.descKey)}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </Container>
                </Section>

                {/* Pricing Section */}
                <Section id="pricing" className="py-20">
                    <Container>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-normal tracking-tight sm:text-4xl mb-4">
                                {t('landing.pricing.title')}
                            </h2>
                            <p className="text-lg text-muted-foreground mb-6">
                                {t('landing.pricing.subtitle')}
                            </p>

                            {/* Billing Toggle */}
                            <div className="inline-flex items-center rounded-lg border p-1 bg-muted/50">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        billingCycle === 'monthly'
                                            ? 'bg-background shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {t('landing.pricing.monthly')}
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        billingCycle === 'yearly'
                                            ? 'bg-background shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {t('landing.pricing.yearly')}
                                    <Badge variant="secondary" className="ml-2">
                                        {t('landing.pricing.save')}
                                    </Badge>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                            {plans.map((plan) => {
                                const price = Number(billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly) || 0;
                                const savings = Number(plan.price_monthly) * 12 - Number(plan.price_yearly);

                                return (
                                    <Card
                                        key={plan.id}
                                        className={`relative ${
                                            plan.is_popular ? 'border-primary shadow-lg' : 'border-border/50'
                                        }`}
                                    >
                                        {plan.is_popular && (
                                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                                                Most Popular
                                            </Badge>
                                        )}
                                        <CardHeader>
                                            <CardTitle className="text-xl font-normal">{plan.name}</CardTitle>
                                            <CardDescription>{plan.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div>
                                                <div className="flex items-baseline gap-1">
                                                    {price === 0 ? (
                                                        <span className="text-4xl font-semibold">Free</span>
                                                    ) : billingCycle === 'monthly' ? (
                                                        <>
                                                            <span className="text-4xl font-semibold">
                                                                RM {price.toFixed(0)}
                                                            </span>
                                                            <span className="text-muted-foreground text-sm">
                                                                /month
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="text-4xl font-semibold">
                                                                RM {price.toFixed(0)}
                                                            </span>
                                                            <span className="text-muted-foreground text-sm">
                                                                /year (save RM {savings.toFixed(0)})
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <ul className="space-y-3">
                                                {(plan.features as string[]).map((feature, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                                        <span className="text-sm">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button
                                                className="w-full"
                                                variant={plan.is_popular ? 'default' : 'outline'}
                                                asChild
                                            >
                                                <Link href={route('register', { plan: plan.code })}>
                                                    {price === 0 ? t('landing.pricing.signUpFree') : `${t('landing.pricing.subscribeTo')} ${plan.name}`}
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </Container>
                </Section>

                {/* Roadmap Section */}
                <Section className="bg-muted/50">
                    <Container>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-normal tracking-tight sm:text-4xl mb-4">
                                {t('landing.roadmap.title')}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {roadmapFeatures.map((feature, index) => (
                                <Card key={index} className="border-border/50">
                                    <CardHeader>
                                        <feature.icon className="h-8 w-8 text-primary mb-2" />
                                        <CardTitle className="text-xl font-normal">{t(feature.titleKey)}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-base">
                                            {t(feature.descKey)}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
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
                                        <a href="#features" className="hover:text-foreground transition-colors">
                                            {t('landing.footer.features')}
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#pricing" className="hover:text-foreground transition-colors">
                                            {t('landing.footer.pricing')}
                                        </a>
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
