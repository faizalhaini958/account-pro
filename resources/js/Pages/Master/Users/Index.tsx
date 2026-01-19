import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, router, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Button } from "@/Components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Badge } from "@/Components/ui/badge"
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
import { useState } from "react"

interface Props {
    users: any[]
    roles: any[]
}

export default function Index({ users, roles }: Props) {
    const { t } = useTranslation()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        role_id: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('master.users.store'), {
            onSuccess: () => {
                setIsDialogOpen(false)
                reset()
            },
        })
    }

    const handleDelete = (id: number) => {
        if (confirm(t('users.removeConfirm'))) {
            router.delete(route('master.users.destroy', id))
        }
    }

    return (
        <DashboardLayout header={t('users.title')}>
            <Head title={t('users.title')} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{t('users.companyUsers')}</h2>
                    <div className="flex items-center space-x-2">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('users.add')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>{t('users.addTitle')}</DialogTitle>
                                    <DialogDescription>
                                        {t('users.addDesc')}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t('users.name')}</Label>
                                        <Input
                                            id="name"
                                            placeholder={t('users.namePlaceholder')}
                                            value={data.name}
                                            onChange={(e) => setData("name", e.target.value)}
                                            required
                                        />
                                        {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">{t('users.email')}</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder={t('users.emailPlaceholder')}
                                            value={data.email}
                                            onChange={(e) => setData("email", e.target.value)}
                                            required
                                        />
                                        {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">{t('users.role')}</Label>
                                        <Select
                                            onValueChange={(value) => setData("role_id", value)}
                                            value={data.role_id}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('users.selectRole')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem key={role.id} value={role.id.toString()}>
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.role_id && <span className="text-sm text-red-500">{errors.role_id}</span>}
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                            {t('users.add')}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('users.name')}</TableHead>
                                <TableHead>{t('users.email')}</TableHead>
                                <TableHead>{t('users.role')}</TableHead>
                                <TableHead>{t('users.status')}</TableHead>
                                <TableHead className="text-right">{t('master.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{user.role_name}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.is_active ? "default" : "destructive"}>
                                            {user.is_active ? t('master.isActive') : t('master.inactive')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={route('master.users.edit', user.id)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> {t('users.editRole')}
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" /> {t('users.remove')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                        {t('users.noUsers')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DashboardLayout>
    )
}
