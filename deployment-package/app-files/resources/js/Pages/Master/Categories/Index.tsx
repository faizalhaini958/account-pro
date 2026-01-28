import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, router, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { DataTable } from "@/Components/ui/data-table"
import { columns } from "./columns"
import { Button } from "@/Components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Switch } from "@/Components/ui/switch"

export default function Index({ categories, parents }: { categories: any; parents: any }) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        description: "",
        parent_id: "",
        is_active: true,
    })

    const handleBulkDelete = (selectedCategories: any[]) => {
        if (confirm(t('master.bulkDeleteConfirm', { count: selectedCategories.length }))) {
            const ids = selectedCategories.map(c => c.id)
            router.delete(route('master.categories.destroy', ids[0]), {
                data: { ids },
                preserveScroll: true,
            })
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('master.categories.store'), {
            onSuccess: () => {
                setOpen(false)
                reset()
            },
        })
    }

    return (
        <DashboardLayout header={t('categories.title')}>
            <Head title={t('categories.title')} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{t('categories.title')}</h2>
                    <div className="flex items-center space-x-2">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('categories.new')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>{t('categories.createTitle')}</DialogTitle>
                                    <DialogDescription>
                                        {t('categories.createDesc')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">{t('categories.name')} *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={e => setData("name", e.target.value)}
                                                placeholder={t('categories.namePlaceholder')}
                                                required
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div>
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
                                                    {parents?.map((p: any) => (
                                                        <SelectItem key={p.id} value={p.id.toString()}>
                                                            {p.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.parent_id && <p className="text-sm text-red-500">{errors.parent_id}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="description">{t('categories.description')}</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={e => setData("description", e.target.value)}
                                                placeholder={t('categories.descriptionPlaceholder')}
                                                rows={3}
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
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            {t('master.cancel')}
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {t('categories.createTitle')}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                    <DataTable
                        columns={columns}
                        data={categories}
                        onBulkDelete={handleBulkDelete}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
