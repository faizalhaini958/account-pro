import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Building2, ArrowLeft } from 'lucide-react';
import { Container, Section } from '@/Components/landing/Layout';
import { ThemeToggle } from '@/Components/ThemeToggle';
import { LanguageSwitcher } from '@/Components/LanguageSwitcher';

export default function TermsOfUse() {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('terms.title', 'Terms of Use')} />

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
                                {t('terms.title', 'Terms of Use')}
                            </h1>
                            <p className="text-muted-foreground mb-8">
                                {t('terms.lastUpdated', 'Last updated: January 19, 2026')}
                            </p>

                            {/* Content */}
                            <div className="prose prose-neutral dark:prose-invert max-w-none">
                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('terms.acceptance.title', '1. Acceptance of Terms')}
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    {t(
                                        'terms.acceptance.content',
                                        'By accessing or using BukuKira, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our service.'
                                    )}
                                </p>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('terms.service.title', '2. Service Description')}
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    {t(
                                        'terms.service.content',
                                        'BukuKira is a cloud-based accounting software designed for Malaysian businesses. We provide tools for invoice management, e-Invoice submission to LHDN, financial reporting, expense tracking, and tax compliance.'
                                    )}
                                </p>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('terms.account.title', '3. Account Registration')}
                                </h2>
                                <p className="text-muted-foreground mb-4">
                                    {t('terms.account.intro', 'When creating an account, you agree to:')}
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                                    <li>{t('terms.account.accurate', 'Provide accurate and complete information')}</li>
                                    <li>{t('terms.account.secure', 'Maintain the security of your password')}</li>
                                    <li>
                                        {t('terms.account.responsible', 'Be responsible for all activities under your account')}
                                    </li>
                                    <li>
                                        {t('terms.account.notify', 'Notify us immediately of any unauthorized access')}
                                    </li>
                                </ul>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('terms.subscription.title', '4. Subscription and Payment')}
                                </h2>
                                <p className="text-muted-foreground mb-4">
                                    {t('terms.subscription.intro', 'Subscription terms:')}
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                                    <li>
                                        {t(
                                            'terms.subscription.plans',
                                            'We offer Free, Starter, Professional, and Enterprise plans'
                                        )}
                                    </li>
                                    <li>{t('terms.subscription.billing', 'Subscriptions are billed monthly or annually')}</li>
                                    <li>
                                        {t(
                                            'terms.subscription.auto',
                                            'Subscriptions automatically renew unless cancelled'
                                        )}
                                    </li>
                                    <li>
                                        {t('terms.subscription.refund', 'Refunds are provided on a case-by-case basis')}
                                    </li>
                                    <li>
                                        {t('terms.subscription.change', 'We reserve the right to change pricing with notice')}
                                    </li>
                                </ul>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('terms.use.title', '5. Acceptable Use')}
                                </h2>
                                <p className="text-muted-foreground mb-4">{t('terms.use.intro', 'You agree NOT to:')}</p>
                                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                                    <li>{t('terms.use.violate', 'Violate any laws or regulations')}</li>
                                    <li>{t('terms.use.infringe', 'Infringe on intellectual property rights')}</li>
                                    <li>{t('terms.use.transmit', 'Transmit malware or harmful code')}</li>
                                    <li>{t('terms.use.interfere', 'Interfere with service operation')}</li>
                                    <li>{t('terms.use.access', 'Attempt unauthorized access to our systems')}</li>
                                    <li>{t('terms.use.resell', 'Resell or redistribute our service')}</li>
                                </ul>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('terms.data.title', '6. Your Data')}
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    {t(
                                        'terms.data.content',
                                        'You retain all rights to your data. We do not claim ownership of any data you upload to BukuKira. You grant us permission to use your data solely to provide our services. You are responsible for the accuracy and legality of your data.'
                                    )}
                                </p>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('terms.compliance.title', '7. Tax and Legal Compliance')}
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    {t(
                                        'terms.compliance.content',
                                        'While BukuKira helps facilitate e-Invoice submission to LHDN, you remain solely responsible for the accuracy of your tax filings and compliance with Malaysian tax laws. BukuKira is a tool to assist with compliance, not a substitute for professional accounting or legal advice.'
                                    )}
                                </p>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('terms.warranty.title', '8. Disclaimer of Warranties')}
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    {t(
                                        'terms.warranty.content',
                                        'BukuKira is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or completely secure. You use the service at your own risk.'
                                    )}
                                </p>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('terms.limitation.title', '9. Limitation of Liability')}
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    {t(
                                        'terms.limitation.content',
                                        'To the maximum extent permitted by law, BukuKira shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.'
                                    )}
                                </p>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('terms.termination.title', '10. Termination')}
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    {t(
                                        'terms.termination.content',
                                        'We reserve the right to suspend or terminate your account for violation of these terms. You may cancel your subscription at any time through your account settings.'
                                    )}
                                </p>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('terms.governing.title', '11. Governing Law')}
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    {t(
                                        'terms.governing.content',
                                        'These Terms shall be governed by the laws of Malaysia. Any disputes shall be resolved in Malaysian courts.'
                                    )}
                                </p>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('terms.changes.title', '12. Changes to Terms')}
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    {t(
                                        'terms.changes.content',
                                        'We may update these Terms from time to time. We will notify you of significant changes via email or through the service. Your continued use after changes indicates acceptance.'
                                    )}
                                </p>

                                <h2 className="text-2xl font-normal tracking-tight mt-8 mb-4">
                                    {t('terms.contact.title', '13. Contact Information')}
                                </h2>
                                <p className="text-muted-foreground mb-6">
                                    {t(
                                        'terms.contact.content',
                                        'If you have questions about these Terms, please contact us at support@bukukira.com'
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
