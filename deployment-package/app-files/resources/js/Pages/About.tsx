import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Building2, Target, Users, Zap, Shield, Globe } from 'lucide-react';
import { Container, Section } from '@/Components/landing/Layout';
import { ThemeToggle } from '@/Components/ThemeToggle';
import { LanguageSwitcher } from '@/Components/LanguageSwitcher';

export default function About() {
    const { t } = useTranslation();

    const values = [
        {
            icon: Target,
            titleKey: 'about.values.simplicity.title',
            descKey: 'about.values.simplicity.desc',
        },
        {
            icon: Shield,
            titleKey: 'about.values.compliance.title',
            descKey: 'about.values.compliance.desc',
        },
        {
            icon: Zap,
            titleKey: 'about.values.innovation.title',
            descKey: 'about.values.innovation.desc',
        },
        {
            icon: Users,
            titleKey: 'about.values.support.title',
            descKey: 'about.values.support.desc',
        },
    ];

    return (
        <>
            <Head title={t('about.title', 'About Us')} />

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
                                <Link
                                    href={route('login')}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t('landing.loginSignup')}
                                </Link>
                            </div>
                        </div>
                    </Container>
                </header>

                {/* Hero Section */}
                <Section className="py-20">
                    <Container>
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="text-4xl md:text-5xl font-normal tracking-tight mb-6">
                                {t('about.hero.title', 'About BukuKira')}
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8">
                                {t(
                                    'about.hero.subtitle',
                                    'Modern accounting software built specifically for Malaysian businesses'
                                )}
                            </p>
                        </div>
                    </Container>
                </Section>

                {/* Mission Section */}
                <Section className="py-16 bg-muted/30">
                    <Container>
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-3xl font-normal tracking-tight mb-6 text-center">
                                {t('about.mission.title', 'Our Mission')}
                            </h2>
                            <p className="text-lg text-muted-foreground text-center mb-8">
                                {t(
                                    'about.mission.content',
                                    'We believe that managing finances and staying compliant should not be complicated. BukuKira was created to help Malaysian SMEs and growing businesses streamline their accounting processes, comply with LHDN e-Invoice regulations, and focus on what they do best—growing their business.'
                                )}
                            </p>
                            <p className="text-lg text-muted-foreground text-center">
                                {t(
                                    'about.mission.content2',
                                    'Built with modern technology and designed with Malaysian businesses in mind, BukuKira provides an intuitive, powerful, and affordable solution for invoice management, financial reporting, and tax compliance.'
                                )}
                            </p>
                        </div>
                    </Container>
                </Section>

                {/* Values Section */}
                <Section className="py-16">
                    <Container>
                        <h2 className="text-3xl font-normal tracking-tight mb-12 text-center">
                            {t('about.values.title', 'Our Core Values')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {values.map((value, index) => (
                                <Card key={index} className="border-border/50">
                                    <CardHeader>
                                        <value.icon className="h-8 w-8 text-primary mb-2" />
                                        <CardTitle className="text-xl font-normal">{t(value.titleKey)}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{t(value.descKey)}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </Container>
                </Section>

                {/* Why BukuKira Section */}
                <Section className="py-16 bg-muted/30">
                    <Container>
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-3xl font-normal tracking-tight mb-6 text-center">
                                {t('about.why.title', 'Why Choose BukuKira?')}
                            </h2>
                            <div className="space-y-4 text-muted-foreground">
                                <div className="flex gap-3">
                                    <Globe className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">
                                            {t('about.why.malaysian.title', 'Built for Malaysia')}
                                        </h3>
                                        <p>
                                            {t(
                                                'about.why.malaysian.desc',
                                                'Full compliance with Malaysian tax regulations including SST, LHDN e-Invoice, and local reporting requirements.'
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">
                                            {t('about.why.modern.title', 'Modern Technology')}
                                        </h3>
                                        <p>
                                            {t(
                                                'about.why.modern.desc',
                                                'Built with the latest web technologies for speed, reliability, and an exceptional user experience.'
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Users className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">
                                            {t('about.why.support.title', 'Customer-Focused')}
                                        </h3>
                                        <p>
                                            {t(
                                                'about.why.support.desc',
                                                'Dedicated support team that understands local business needs and provides assistance in English and Bahasa Melayu.'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
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
