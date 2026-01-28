import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Switch } from "@/Components/ui/switch"
import { Loader2, ArrowLeft } from "lucide-react"

interface Props {
    category: any
    parents: any[]
}

export default function Edit({ category, parents }: Props) {
    const { t } = useTranslation()
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        description: category.description || "",
        parent_id: category.parent_id ? category.parent_id.toString() : "",
        is_active: Boolean(category.is_active),
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(route('master.categories.update', category.id))
    }

    return (
        <DashboardLayout header={`${t('categories.editTitle')}: ${category.name}`}>
            <Head title={`${t('categories.editTitle')} ${category.name}`} />

            <div className="max-w-2xl mx-auto py-6 space-y-6">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href={route('master.categories.index')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('categories.back')}
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('categories.editTitle')}</CardTitle>
                        <CardDescription>
                            {t('categories.createDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('categories.name')}</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData("name", e.target.value)}
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="parent_id">{t('categories.parent')}</Label>
                                <Select
                                    value={data.parent_id}
                                    onValueChange={val => setData("parent_id", val === "none" ? "" : val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('categories.selectParent')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('categories.noParent')}</SelectItem>
                                        {parents.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.parent_id && <p className="text-sm text-red-500">{errors.parent_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">{t('categories.description')}</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData("description", e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between border p-4 rounded-md">
                                <div className="space-y-0.5">
                                    <Label className="text-base">{t('master.isActiveStatus')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('categories.inactiveNote')}
                                    </p>
                                </div>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={val => setData("is_active", val)}
                                />
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('master.categories.index')}>{t('master.cancel')}</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t('common.saveChanges')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
