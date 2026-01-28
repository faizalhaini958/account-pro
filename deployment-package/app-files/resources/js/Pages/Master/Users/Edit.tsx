import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Switch } from "@/Components/ui/switch"
import { ArrowLeft, Loader2 } from "lucide-react"

interface Props {
    user: any
    roles: any[]
}

export default function Edit({ user, roles }: Props) {
    const { t } = useTranslation()
    const { data, setData, put, processing, errors } = useForm({
        role_id: user.role_id.toString(),
        is_active: Boolean(user.is_active),
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(route('master.users.update', user.id))
    }

    return (
        <DashboardLayout header={t('users.editTitle')}>
            <Head title={`${t('users.editTitle')} ${user.name}`} />

            <div className="max-w-2xl mx-auto py-6 space-y-6">
                <Button variant="ghost" asChild className="pl-0">
                    <Link href={route('master.users.index')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> {t('users.back')}
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('users.editTitle')}: {user.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label>{t('users.email')}</Label>
                                <Input value={user.email} disabled className="bg-muted" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">{t('users.role')}</Label>
                                <Select
                                    value={data.role_id}
                                    onValueChange={val => setData("role_id", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('users.selectRole')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map(role => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role_id && <p className="text-sm text-red-500">{errors.role_id}</p>}
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">{t('master.isActiveStatus')}</Label>
                                    <div className="text-sm text-muted-foreground">
                                        {t('users.activeNote')}
                                    </div>
                                </div>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={val => setData("is_active", val)}
                                />
                            </div>

                            <div className="flex justify-end">
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
