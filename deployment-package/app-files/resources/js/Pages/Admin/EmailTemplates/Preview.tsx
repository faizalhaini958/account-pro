import { Head, Link } from '@inertiajs/react';
import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface EmailTemplate {
    id: number;
    key: string;
    name: string;
    category: string;
    subject: string;
}

interface Props {
    template: EmailTemplate;
    renderedSubject: string;
    renderedContent: string;
}

export default function Preview({ template, renderedSubject, renderedContent }: Props) {
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
                            Preview: {template.name}
                        </h2>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.email-templates.edit', template.id)}>
                            Edit Template
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title={`Preview ${template.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    {/* Subject Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Subject</CardTitle>
                            <CardDescription>How the subject line will appear</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg bg-muted/50 p-4">
                                <p className="font-medium">{renderedSubject}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Content</CardTitle>
                            <CardDescription>
                                Preview with sample data. Actual emails will use real data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border bg-card">
                                <div
                                    className="prose prose-sm dark:prose-invert max-w-none p-6"
                                    dangerouslySetInnerHTML={{ __html: renderedContent }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
