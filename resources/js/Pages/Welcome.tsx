import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    BarChart3,
    FileText,
    TrendingUp,
    Shield,
    Zap,
    Globe,
    Check,
    ArrowRight,
    Menu,
    X
} from 'lucide-react';
import { LanguageSwitcher } from '@/Components/LanguageSwitcher';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WelcomeProps {
    canLogin: boolean;
    canRegister: boolean;
}

export default function Welcome({ canLogin, canRegister }: WelcomeProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { t } = useTranslation();

    const features = [
        {
            icon: BarChart3,
            title: t('welcome.feature.analytics'),
            description: t('welcome.feature.analyticsDesc'),
        },
        {
            icon: FileText,
            title: t('welcome.feature.einvoice'),
            description: t('welcome.feature.einvoiceDesc'),
        },
        {
            icon: TrendingUp,
            title: t('welcome.feature.reports'),
            description: t('welcome.feature.reportsDesc'),
        },
        {
            icon: Shield,
            title: t('welcome.feature.security'),
            description: t('welcome.feature.securityDesc'),
        },
        {
            icon: Zap,
            title: t('welcome.feature.workflows'),
            description: t('welcome.feature.workflowsDesc'),
        },
        {
            icon: Globe,
            title: t('welcome.feature.bilingual'),
            description: t('welcome.feature.bilingualDesc'),
        },
    ];

    const pricingPlans = [
        {
            name: 'Starter',
            price: 'RM 99',
            period: '/month',
            description: 'Perfect for small businesses',
            features: [
                '1 Company',
                'Up to 100 invoices/month',
                'Basic reports',
                'Email support',
                'e-Invoice submission',
            ],
        },
        {
            name: 'Professional',
            price: 'RM 299',
            period: '/month',
            description: 'For growing businesses',
            features: [
                '3 Companies',
                'Unlimited invoices',
                'Advanced reports',
                'Priority support',
                'e-Invoice & SST',
                'Multi-user access',
                'API access',
            ],
            popular: true,
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            description: 'For large organizations',
            features: [
                'Unlimited companies',
                'Unlimited everything',
                'Custom reports',
                '24/7 dedicated support',
                'White-label option',
                'Custom integrations',
                'On-premise deployment',
            ],
        },
    ];

    return (
        <>
            <Head title="BukuKira - Modern Accounting Software" />

            <div className="min-h-screen bg-gradient-to-r from-violet-500 via-purple-500 to-orange-400 font-sans selection:bg-purple-200">
                {/* Top Notification Bar */}
                <div className="container mx-auto px-4 py-3 flex justify-center items-center gap-4 text-white text-sm relative z-10">
                    <span className="bg-white text-purple-900 font-bold px-3 py-1 rounded-full text-xs shadow-sm">{t('welcome.upgrade')}</span>
                    <span className="hidden sm:inline font-medium text-white/95 tracking-wide">{t('welcome.discount')}</span>
                </div>

                {/* Main Content Container - The "White Sheet" */}
                <div className="mx-2 sm:mx-6 md:mx-10 lg:mx-16 bg-white rounded-t-[40px] md:rounded-t-[60px] shadow-2xl min-h-screen relative z-20">

                    {/* Navbar */}
                    <nav className="px-6 sm:px-10 py-6 flex justify-between items-center border-b border-gray-100">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5">
                            <span className="text-3xl font-extrabold text-indigo-950 tracking-tighter">
                                BukuKira
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6 font-bold text-sm tracking-wide text-gray-500">
                            <a href="#" className="text-purple-600">{t('welcome.home')}</a>
                            <a href="#features" className="hover:text-purple-600 transition-colors">{t('welcome.pages')}</a>
                            <a href="#services" className="hover:text-purple-600 transition-colors">{t('welcome.services')}</a>
                            <a href="#pricing" className="hover:text-purple-600 transition-colors">{t('welcome.pricing')}</a>
                            <a href="#contact" className="hover:text-purple-600 transition-colors">{t('welcome.contact')}</a>
                            <LanguageSwitcher />
                        </div>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            {canLogin ? (
                                <Link href={route('login')}>
                                    <Button className="bg-indigo-950 hover:bg-indigo-900 text-white rounded-full px-8 py-6 font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105">
                                        {t('welcome.dashboard')}
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')}>
                                        <Button variant="ghost" className="font-bold text-indigo-950 hover:text-purple-600 hover:bg-transparent">
                                            {t('auth.login').toUpperCase()}
                                        </Button>
                                    </Link>
                                    {canRegister && (
                                        <Link href={route('register')}>
                                            <Button className="bg-indigo-950 hover:bg-indigo-900 text-white rounded-full px-8 py-6 font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105">
                                                {t('welcome.freeDownload')}
                                            </Button>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-indigo-950 p-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        {/* Mobile Menu Dropdown */}
                        {mobileMenuOpen && (
                            <div className="absolute top-full left-0 right-0 bg-white border-b shadow-xl rounded-b-2xl p-6 space-y-4 z-50 md:hidden animate-in slide-in-from-top-2">
                                <a href="#" className="block text-purple-600 font-bold">HOME</a>
                                <a href="#features" className="block text-gray-600 font-bold">PAGES</a>
                                <a href="#services" className="block text-gray-600 font-bold">SERVICES</a>
                                <a href="#pricing" className="block text-gray-600 font-bold">PRICING</a>
                                <a href="#contact" className="block text-gray-600 font-bold">CONTACT</a>
                                <div className="pt-4 flex flex-col gap-3">
                                    {canLogin ? (
                                        <Link href={route('login')}>
                                            <Button className="w-full bg-indigo-950 text-white rounded-full py-6 font-bold">DASHBOARD</Button>
                                        </Link>
                                    ) : (
                                        <>
                                            <Link href={route('login')}>
                                                <Button variant="outline" className="w-full rounded-full py-6 font-bold">LOG IN</Button>
                                            </Link>
                                            {canRegister && (
                                                <Link href={route('register')}>
                                                    <Button className="w-full bg-indigo-950 text-white rounded-full py-6 font-bold">FREE DOWNLOAD</Button>
                                                </Link>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </nav>

                    {/* Hero Section */}
                    <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
                        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-xs font-bold tracking-wide uppercase">
                            <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></span>
                            {t('welcome.madeFor')}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 text-indigo-950 tracking-tight leading-tight">
                            {t('welcome.heroTitle')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-400">{t('welcome.heroPlatform')}</span>
                        </h1>
                        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                            {t('welcome.heroDesc')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                            {canRegister && (
                                <Link href={route('register')}>
                                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-orange-400 hover:from-purple-700 hover:to-orange-500 text-white rounded-full px-10 py-7 text-lg font-bold shadow-xl shadow-purple-200 transition-all hover:scale-105">
                                        {t('welcome.startFreeTrial')}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                            <Button size="lg" variant="outline" className="rounded-full px-10 py-7 text-lg font-bold text-gray-600 hover:text-purple-600 hover:border-purple-200">
                                {t('welcome.watchDemo')}
                            </Button>
                        </div>

                        {/* Mockup */}
                        <div className="mt-20 relative mx-auto max-w-4xl transform hover:scale-[1.01] transition-transform duration-500">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-orange-400 rounded-2xl blur opacity-20"></div>
                            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                                <div className="aspect-[16/9] bg-slate-50 relative group">
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/50 to-transparent"></div>
                                    <div className="flex items-center justify-center h-full text-slate-300">
                                        <BarChart3 className="w-32 h-32 opacity-20" />
                                    </div>
                                    {/* UI Mockup elements */}
                                    <div className="absolute top-8 left-8 right-8 bottom-0 bg-white shadow-xl rounded-t-xl p-6">
                                        <div className="flex gap-4 mb-6">
                                            <div className="w-1/4 h-24 bg-purple-50 rounded-lg"></div>
                                            <div className="w-1/4 h-24 bg-orange-50 rounded-lg"></div>
                                            <div className="w-1/4 h-24 bg-blue-50 rounded-lg"></div>
                                            <div className="w-1/4 h-24 bg-green-50 rounded-lg"></div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-4 bg-slate-100 rounded w-full"></div>
                                            <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                                            <div className="h-4 bg-slate-100 rounded w-4/6"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-indigo-950">Everything you need</h2>
                            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                                Powerful features to manage your finances, comply with regulations, and grow your business.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white group">
                                        <CardHeader>
                                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors duration-300">
                                                <Icon className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors duration-300" />
                                            </div>
                                            <CardTitle className="text-xl font-bold text-indigo-950">{feature.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-base text-gray-500 leading-relaxed">
                                                {feature.description}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </section>

                    {/* Remaining Sections (Pricing, CTA, Footer) would go here inside the white container */}

                    {/* Footer */}
                    <footer className="bg-white border-t border-gray-100 pt-20 pb-12">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid md:grid-cols-4 gap-12 mb-16">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-2xl font-bold text-indigo-950 tracking-tight">BukuKira</span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Modern accounting software for Malaysian businesses.
                                    </p>
                                </div>
                                {/* ... Footer Columns ... */}
                                <div>
                                    <h3 className="font-bold text-indigo-950 mb-6">Product</h3>
                                    <ul className="space-y-4 text-gray-500">
                                        <li><a href="#" className="hover:text-purple-600 transition-colors">Features</a></li>
                                        <li><a href="#" className="hover:text-purple-600 transition-colors">Pricing</a></li>
                                        <li><a href="#" className="hover:text-purple-600 transition-colors">Documentation</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-indigo-950 mb-6">Company</h3>
                                    <ul className="space-y-4 text-gray-500">
                                        <li><a href="#" className="hover:text-purple-600 transition-colors">About</a></li>
                                        <li><a href="#" className="hover:text-purple-600 transition-colors">Blog</a></li>
                                        <li><a href="#" className="hover:text-purple-600 transition-colors">Contact</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-indigo-950 mb-6">Legal</h3>
                                    <ul className="space-y-4 text-gray-500">
                                        <li><a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a></li>
                                        <li><a href="#" className="hover:text-purple-600 transition-colors">Terms of Service</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-8 text-center text-gray-400 text-sm">
                                <p>&copy; 2026 BukuKira. All rights reserved.</p>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
