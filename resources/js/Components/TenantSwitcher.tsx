import * as React from "react"
import { Building2, ChevronsUpDown, Check, Plus } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/Components/ui/sidebar"
import { usePage, router, useForm } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
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
import { Button } from "@/Components/ui/button"

export function TenantSwitcher() {
    const { isMobile } = useSidebar()
    const { t } = useTranslation()
    const { auth } = usePage<any>().props
    const activeTenant = auth.current_tenant
    const tenants = auth.tenants || []
    const [open, setOpen] = React.useState(false)

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    })

    const handleSwitch = (tenantId: number) => {
        router.post(route('tenant.switch'), { tenant_id: tenantId })
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route('companies.store'), {
            onSuccess: () => {
                setOpen(false)
                reset()
            },
        })
    }

    return (
        <SidebarMenu>
            <Dialog open={open} onOpenChange={setOpen}>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <Avatar className="size-8 rounded-lg">
                                    <AvatarImage src={activeTenant?.logo_url || undefined} className="object-cover" />
                                    <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        {activeTenant ? activeTenant.name.substring(0, 2).toUpperCase() : 'CO'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {activeTenant ? activeTenant.name : t('user.selectCompany')}
                                    </span>
                                    <span className="truncate text-xs">
                                        {activeTenant ? t('user.active') : t('user.noCompany')}
                                    </span>
                                </div>
                                <ChevronsUpDown className="ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            align="start"
                            side={isMobile ? "bottom" : "right"}
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                {t('user.teams')}
                            </DropdownMenuLabel>
                            {tenants.map((tenant: any) => (
                                <DropdownMenuItem
                                    key={tenant.name}
                                    onClick={() => handleSwitch(tenant.id)}
                                    className="gap-2 p-2"
                                >
                                    <Avatar className="size-6 rounded-sm">
                                        <AvatarImage src={tenant.logo_url || undefined} className="object-cover" />
                                        <AvatarFallback className="rounded-sm text-xs">
                                            {tenant.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {tenant.name}

                                    {activeTenant?.id === tenant.id && <Check className="ml-auto h-4 w-4" />}

                                    {activeTenant?.id === tenant.id && (
                                        <DropdownMenuShortcut>⌘{tenants.indexOf(tenant) + 1}</DropdownMenuShortcut>
                                    )}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 p-2" onSelect={() => setOpen(true)}>
                                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                    <Plus className="size-4" />
                                </div>
                                <div className="font-medium text-muted-foreground">{t('user.addTeam')}</div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Company</DialogTitle>
                        <DialogDescription>
                            Add a new company to manage.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Company Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Acme Inc."
                                required
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Create Company
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </SidebarMenu>
    )
}
