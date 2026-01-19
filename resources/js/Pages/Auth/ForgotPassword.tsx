import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Building2, ArrowLeft } from 'lucide-react';
import { Container, Section } from '@/Components/landing/Layout';
import { ThemeToggle } from '@/Components/ThemeToggle';
import { LanguageSwitcher } from '@/Components/LanguageSwitcher';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <>
            <Head title={t('auth.forgotPassword', 'Forgot Password')} />

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

                {/* Forgot Password Form */}
                <Section className="py-20">
                    <Container>
                        <div className="max-w-md mx-auto">
                            {/* Back Button */}
                            <Link
                                href={route('login')}
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {t('auth.backToLogin', 'Back to login')}
                            </Link>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-normal tracking-tight mb-2">
                                    {t('auth.resetPassword', 'Reset Password')}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t(
                                        'auth.forgotPasswordDesc',
                                        'Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.'
                                    )}
                                </p>
                            </div>

                            {status && (
                                <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-600 dark:text-green-400">
                                    {status}
                                </div>
                            )}

                            <Card className="border-border/50">
                                <CardContent className="pt-6">
                                    <form onSubmit={submit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">{t('auth.email', 'Email')}</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                                autoFocus
                                                placeholder={t('auth.emailPlaceholder', 'your@email.com')}
                                                className="w-full"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full"
                                            size="lg"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? t('common.loading', 'Loading...')
                                                : t('auth.sendResetLink', 'Email Password Reset Link')}
                                        </Button>

                                        <div className="text-center text-sm text-muted-foreground">
                                            {t('auth.rememberPassword', 'Remember your password?')}{' '}
                                            <Link
                                                href={route('login')}
                                                className="text-primary hover:underline font-medium"
                                            >
                                                {t('auth.login', 'Log in')}
                                            </Link>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
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
