import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Building2, ArrowLeft } from 'lucide-react';
import { Container, Section } from '@/Components/landing/Layout';
import { ThemeToggle } from '@/Components/ThemeToggle';
import { LanguageSwitcher } from '@/Components/LanguageSwitcher';

export default function PrivacyPolicy() {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('privacy.title', 'Privacy Policy')} />

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

                <Section className="py-20">
                    <Container>
                        <div className="max-w-3xl mx-auto">
                            {/* Back Button */}
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {t('common.back', 'Back to home')}
                            </Link>

                            {/* Header */}
                            <h1 className="text-4xl font-normal tracking-tight mb-4">
                                {t('privacy.title', 'Privacy Policy')}
                            </h1>
                            <p className="text-muted-foreground mb-8">
                                {t('privacy.lastUpdated', 'Last updated: January 19, 2026')}
                            </p>

                            {/* Content */}
                            <div className="prose prose-neutral dark:prose-invert max-w-none">
                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('privacy.intro.title', '1. Introduction')}
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    {t(
                                        'privacy.intro.content',
                                        'BukuKira ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our accounting software service.'
                                    )}
                                </p>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('privacy.collection.title', '2. Information We Collect')}
                                </h2>
                                <p className="text-muted-foreground mb-4">
                                    {t('privacy.collection.intro', 'We collect information that you provide directly to us:')}
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                                    <li>{t('privacy.collection.account', 'Account information (name, email, password)')}</li>
                                    <li>
                                        {t(
                                            'privacy.collection.business',
                                            'Business information (company name, registration number, tax ID)'
                                        )}
                                    </li>
                                    <li>
                                        {t(
                                            'privacy.collection.financial',
                                            'Financial data (invoices, expenses, customers, suppliers)'
                                        )}
                                    </li>
                                    <li>{t('privacy.collection.usage', 'Usage data and analytics')}</li>
                                </ul>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('privacy.use.title', '3. How We Use Your Information')}
                                </h2>
                                <p className="text-muted-foreground mb-4">{t('privacy.use.intro', 'We use your information to:')}</p>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                                    <li>{t('privacy.use.provide', 'Provide and maintain our services')}</li>
                                    <li>{t('privacy.use.process', 'Process transactions and generate invoices')}</li>
                                    <li>{t('privacy.use.comply', 'Comply with LHDN e-Invoice regulations')}</li>
                                    <li>{t('privacy.use.improve', 'Improve and optimize our software')}</li>
                                    <li>{t('privacy.use.support', 'Provide customer support')}</li>
                                    <li>{t('privacy.use.communicate', 'Send important updates and notifications')}</li>
                                </ul>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('privacy.security.title', '4. Data Security')}
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    {t(
                                        'privacy.security.content',
                                        'We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits. Your financial data is stored in secure, isolated environments with multi-tenant security architecture.'
                                    )}
                                </p>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('privacy.sharing.title', '5. Information Sharing')}
                                </h2>
                                <p className="text-muted-foreground mb-4">
                                    {t('privacy.sharing.intro', 'We do not sell your personal information. We may share your data with:')}
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                                    <li>
                                        {t(
                                            'privacy.sharing.lhdn',
                                            'LHDN (Lembaga Hasil Dalam Negeri) for e-Invoice submission as required by law'
                                        )}
                                    </li>
                                    <li>{t('privacy.sharing.providers', 'Service providers who help us operate our platform')}</li>
                                    <li>{t('privacy.sharing.legal', 'Legal authorities when required by law')}</li>
                                </ul>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('privacy.rights.title', '6. Your Rights')}
                                </h2>
                                <p className="text-muted-foreground mb-4">{t('privacy.rights.intro', 'You have the right to:')}</p>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                                    <li>{t('privacy.rights.access', 'Access your personal data')}</li>
                                    <li>{t('privacy.rights.correct', 'Correct inaccurate data')}</li>
                                    <li>{t('privacy.rights.delete', 'Request deletion of your data')}</li>
                                    <li>{t('privacy.rights.export', 'Export your data')}</li>
                                    <li>{t('privacy.rights.object', 'Object to data processing')}</li>
                                </ul>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('privacy.compliance.title', '7. Malaysian Data Protection')}
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    {t(
                                        'privacy.compliance.content',
                                        'We comply with the Personal Data Protection Act 2010 (PDPA) of Malaysia. Your data is stored and processed in accordance with Malaysian data protection laws.'
                                    )}
                                </p>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('privacy.contact.title', '8. Contact Us')}
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    {t(
                                        'privacy.contact.content',
                                        'If you have questions about this Privacy Policy, please contact us at privacy@bukukira.com'
                                    )}
                                </p>
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
