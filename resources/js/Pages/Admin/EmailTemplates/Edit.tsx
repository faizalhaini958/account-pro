import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { ArrowLeft, Save, RotateCcw, Info } from 'lucide-react';

interface EmailTemplate {
    id: number;
    key: string;
    name: string;
    category: string;
    subject: string;
    content: string;
    variables: string[];
    description: string;
    is_active: boolean;
}

interface Props {
    template: EmailTemplate;
}

export default function Edit({ template }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: template.name,
        subject: template.subject,
        content: template.content,
        description: template.description,
        is_active: template.is_active,
    });

    const [showVariables, setShowVariables] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.email-templates.update', template.id));
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset this template to default? This action cannot be undone.')) {
            // Call reset endpoint
            window.location.href = route('admin.email-templates.reset', template.id);
        }
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.email-templates.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <h2 className="text-xl font-semibold leading-tight">
                            Edit Email Template
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={`Edit ${template.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Template Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{template.name}</CardTitle>
                                <CardDescription>
                                    Category: {template.category.charAt(0).toUpperCase() + template.category.slice(1)} •
                                    Key: <code className="text-xs">{template.key}</code>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Description */}
                                {template.description && (
                                    <Alert>
                                        <Info className="h-4 w-4" />
                                        <AlertDescription>{template.description}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Available Variables */}
                                {template.variables && template.variables.length > 0 && (
                                    <div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowVariables(!showVariables)}
                                            className="mb-2"
                                        >
                                            {showVariables ? 'Hide' : 'Show'} Available Variables
                                        </Button>
                                        {showVariables && (
                                            <div className="rounded-lg bg-muted/50 p-4">
                                                <p className="text-sm font-medium mb-2">Use these variables in your template:</p>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {template.variables.map((variable) => (
                                                        <code
                                                            key={variable}
                                                            className="text-xs bg-background px-2 py-1 rounded border cursor-pointer hover:bg-accent"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`{{${variable}}}`);
                                                            }}
                                                            title="Click to copy"
                                                        >
                                                            {'{{'}{variable}{'}}'}
                                                        </code>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Click any variable to copy. Paste it into the content below.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Template Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Template Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Email Subject */}
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Email Subject</Label>
                                    <Input
                                        id="subject"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        className={errors.subject ? 'border-red-500' : ''}
                                        placeholder="Use {{variable_name}} for dynamic content"
                                    />
                                    {errors.subject && (
                                        <p className="text-sm text-red-600">{errors.subject}</p>
                                    )}
                                </div>

                                {/* Email Content */}
                                <div className="space-y-2">
                                    <Label htmlFor="content">Email Content (HTML)</Label>
                                    <Textarea
                                        id="content"
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        className={`font-mono text-sm ${errors.content ? 'border-red-500' : ''}`}
                                        rows={20}
                                        placeholder="Use {{variable_name}} for dynamic content"
                                    />
                                    {errors.content && (
                                        <p className="text-sm text-red-600">{errors.content}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        HTML is supported. The content will be wrapped with the email layout automatically.
                                    </p>
                                </div>

                                {/* Template Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description || ''}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        placeholder="Add notes about when this template is used..."
                                    />
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active">Template is active</Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset to Default
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                >
                                    <Link href={route('admin.email-templates.preview', template.id)}>
                                        Preview
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
