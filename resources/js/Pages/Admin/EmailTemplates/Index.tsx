import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Mail, Search, Filter } from 'lucide-react';

interface EmailTemplate {
    id: number;
    key: string;
    name: string;
    category: string;
    subject: string;
    is_active: boolean;
    updated_at: string;
}

interface Props {
    templates: EmailTemplate[];
    categories: string[];
    currentCategory?: string;
}

export default function Index({ templates, categories, currentCategory }: Props) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(currentCategory || 'all');

    const filteredTemplates = templates.filter((template) => {
        const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
                            template.subject.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        router.get(route('admin.email-templates.index'),
            category !== 'all' ? { category } : {},
            { preserveState: true }
        );
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            auth: 'bg-blue-100 text-blue-800',
            subscription: 'bg-purple-100 text-purple-800',
            invoice: 'bg-green-100 text-green-800',
            einvoice: 'bg-orange-100 text-orange-800',
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight">
                        Email Templates
                    </h2>
                </div>
            }
        >
            <Head title="Email Templates" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Manage Email Templates
                            </CardTitle>
                            <CardDescription>
                                Customize email content sent to users and customers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Filters */}
                            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex-1 max-w-sm">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Search templates..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Templates List */}
                            <div className="space-y-3">
                                {filteredTemplates.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        No templates found
                                    </div>
                                ) : (
                                    filteredTemplates.map((template) => (
                                        <div
                                            key={template.id}
                                            className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-medium">
                                                        {template.name}
                                                    </h3>
                                                    <Badge className={getCategoryColor(template.category)}>
                                                        {template.category}
                                                    </Badge>
                                                    {!template.is_active && (
                                                        <Badge variant="outline">Inactive</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    Subject: {template.subject}
                                                </p>
                                                <p className="text-xs text-muted-foreground/70 mt-1">
                                                    Last updated: {new Date(template.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link href={route('admin.email-templates.preview', template.id)}>
                                                        Preview
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link href={route('admin.email-templates.edit', template.id)}>
                                                        Edit
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
