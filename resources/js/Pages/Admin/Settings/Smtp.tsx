import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Separator } from '@/Components/ui/separator';
import {
    Mail,
    Send,
    AlertCircle,
    CheckCircle2,
    Loader2,
} from 'lucide-react';
import { useState } from 'react';

interface SmtpSettings {
    mail_driver: string;
    mail_host: string;
    mail_port: number;
    mail_username: string;
    mail_password: string;
    mail_encryption: string;
    mail_from_address: string;
    mail_from_name: string;
}

interface SmtpPageProps {
    settings: SmtpSettings;
}

export default function SmtpSettingsPage({ settings }: SmtpPageProps) {
    const [testEmail, setTestEmail] = useState('');
    const [testing, setTesting] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        mail_driver: settings.mail_driver,
        mail_host: settings.mail_host,
        mail_port: settings.mail_port,
        mail_username: settings.mail_username,
        mail_password: settings.mail_password,
        mail_encryption: settings.mail_encryption,
        mail_from_address: settings.mail_from_address,
        mail_from_name: settings.mail_from_name,
    });

    const testForm = useForm({
        test_email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.smtp.update'));
    };

    const handleTest = (e: React.FormEvent) => {
        e.preventDefault();
        testForm.setData('test_email', testEmail);
        testForm.post(route('admin.settings.smtp.test'), {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout header="SMTP Settings">
            <Head title="SMTP Settings" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">SMTP / Email Settings</h2>
                    <p className="text-muted-foreground">
                        Configure email settings for system notifications
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Email Configuration
                            </CardTitle>
                            <CardDescription>
                                Set up your SMTP server to send system emails
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Mail Driver */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="mail_driver">Mail Driver</Label>
                                    <Select
                                        value={data.mail_driver}
                                        onValueChange={(value) => setData('mail_driver', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select mail driver" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="smtp">SMTP</SelectItem>
                                            <SelectItem value="sendmail">Sendmail</SelectItem>
                                            <SelectItem value="mailgun">Mailgun</SelectItem>
                                            <SelectItem value="ses">Amazon SES</SelectItem>
                                            <SelectItem value="postmark">Postmark</SelectItem>
                                            <SelectItem value="log">Log (for testing)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.mail_driver && (
                                        <p className="text-sm text-destructive">{errors.mail_driver}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mail_encryption">Encryption</Label>
                                    <Select
                                        value={data.mail_encryption}
                                        onValueChange={(value) => setData('mail_encryption', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select encryption" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tls">TLS</SelectItem>
                                            <SelectItem value="ssl">SSL</SelectItem>
                                            <SelectItem value="null">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.mail_encryption && (
                                        <p className="text-sm text-destructive">{errors.mail_encryption}</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* SMTP Server Settings */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="mail_host">SMTP Host</Label>
                                    <Input
                                        id="mail_host"
                                        value={data.mail_host}
                                        onChange={(e) => setData('mail_host', e.target.value)}
                                        placeholder="smtp.example.com"
                                    />
                                    {errors.mail_host && (
                                        <p className="text-sm text-destructive">{errors.mail_host}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mail_port">SMTP Port</Label>
                                    <Input
                                        id="mail_port"
                                        type="number"
                                        value={data.mail_port}
                                        onChange={(e) => setData('mail_port', parseInt(e.target.value))}
                                        placeholder="587"
                                    />
                                    {errors.mail_port && (
                                        <p className="text-sm text-destructive">{errors.mail_port}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="mail_username">SMTP Username</Label>
                                    <Input
                                        id="mail_username"
                                        value={data.mail_username}
                                        onChange={(e) => setData('mail_username', e.target.value)}
                                        placeholder="your@email.com"
                                    />
                                    {errors.mail_username && (
                                        <p className="text-sm text-destructive">{errors.mail_username}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mail_password">SMTP Password</Label>
                                    <Input
                                        id="mail_password"
                                        type="password"
                                        value={data.mail_password}
                                        onChange={(e) => setData('mail_password', e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    {errors.mail_password && (
                                        <p className="text-sm text-destructive">{errors.mail_password}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Leave blank to keep existing password
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* From Address */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="mail_from_address">From Email Address</Label>
                                    <Input
                                        id="mail_from_address"
                                        type="email"
                                        value={data.mail_from_address}
                                        onChange={(e) => setData('mail_from_address', e.target.value)}
                                        placeholder="noreply@example.com"
                                    />
                                    {errors.mail_from_address && (
                                        <p className="text-sm text-destructive">{errors.mail_from_address}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mail_from_name">From Name</Label>
                                    <Input
                                        id="mail_from_name"
                                        value={data.mail_from_name}
                                        onChange={(e) => setData('mail_from_name', e.target.value)}
                                        placeholder="AccountPro"
                                    />
                                    {errors.mail_from_name && (
                                        <p className="text-sm text-destructive">{errors.mail_from_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Settings'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>

                {/* Test Email */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Test Email Configuration
                        </CardTitle>
                        <CardDescription>
                            Send a test email to verify your SMTP settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleTest} className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    type="email"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    placeholder="Enter email to send test"
                                    required
                                />
                            </div>
                            <Button type="submit" variant="secondary" disabled={testForm.processing}>
                                {testForm.processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Test Email
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Help */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Common SMTP Settings</AlertTitle>
                    <AlertDescription>
                        <ul className="mt-2 space-y-1 text-sm">
                            <li><strong>Gmail:</strong> smtp.gmail.com, Port 587, TLS (requires App Password)</li>
                            <li><strong>Office 365:</strong> smtp.office365.com, Port 587, TLS</li>
                            <li><strong>Mailgun:</strong> smtp.mailgun.org, Port 587, TLS</li>
                            <li><strong>Amazon SES:</strong> email-smtp.[region].amazonaws.com, Port 587, TLS</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </div>
        </AdminLayout>
    );
}
