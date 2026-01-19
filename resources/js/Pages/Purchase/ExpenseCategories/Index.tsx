import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, useForm } from "@inertiajs/react"
import { DataTable } from "@/Components/ui/data-table"
import { getColumns } from "./columns" // Import getColumns
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
import { useTranslation } from 'react-i18next';

export default function Index({ categories, accounts }: { categories: any; accounts: any[] }) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        description: "",
        account_id: "",
        is_active: true,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('purchase.expense-categories.store'), {
            onSuccess: () => {
                setOpen(false)
                reset()
            },
        })
    }

    return (
        <DashboardLayout header={t('expenseCategories.title')}>
            <Head title={t('expenseCategories.title')} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{t('expenseCategories.header')}</h2>
                    <div className="flex items-center space-x-2">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('expenseCategories.new')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>{t('expenseCategories.createTitle')}</DialogTitle>
                                    <DialogDescription>
                                        {t('expenseCategories.createDesc')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">{t('expenseCategories.name')}</Label>
                                            <Input
                                                id="name"
                                                placeholder={t('expenseCategories.namePlaceholder')}
                                                value={data.name}
                                                onChange={(e) => setData("name", e.target.value)}
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="account_id">{t('expenseCategories.account')}</Label>
                                            <Select
                                                value={data.account_id}
                                                onValueChange={(val) => setData("account_id", val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('expenseCategories.selectAccount')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {accounts?.map((account) => (
                                                        <SelectItem key={account.id} value={account.id.toString()}>
                                                            <span className="font-mono text-muted-foreground mr-2">{account.code}</span>
                                                            {account.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">{t('expenseCategories.accountHelp')}</p>
                                            {errors.account_id && <p className="text-sm text-red-500">{errors.account_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">{t('expenseCategories.description')}</Label>
                                            <Textarea
                                                id="description"
                                                placeholder={t('expenseCategories.descriptionPlaceholder')}
                                                value={data.description}
                                                onChange={(e) => setData("description", e.target.value)}
                                            />
                                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">{t('expenseCategories.isActive')}</Label>
                                            </div>
                                            <Switch
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData("is_active", checked)}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            {t('common.cancel')}
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {t('expenseCategories.create')}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                    <DataTable
                        columns={getColumns(t)}
                        data={categories.data}
                    />
                </div>
            </div>
        </DashboardLayout>
    )
}
