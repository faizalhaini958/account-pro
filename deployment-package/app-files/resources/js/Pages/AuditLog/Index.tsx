import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link, router } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Button } from "@/Components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table"
import { Badge } from "@/Components/ui/badge"
import { Download, Eye, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { useState } from "react"
import { format } from "date-fns"

interface AuditLog {
    id: number
    user_id: number | null
    user: { id: number; name: string; email: string } | null
    auditable_type: string
    auditable_id: number
    event: string
    event_label: string
    model_name: string
    old_values: Record<string, any> | null
    new_values: Record<string, any> | null
    ip_address: string
    created_at: string
}

interface PaginatedData<T> {
    data: T[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    links: Array<{ url: string | null; label: string; active: boolean }>
}

interface Props {
    logs: PaginatedData<AuditLog>
    events: Array<{ value: string; label: string }>
    models: Array<{ value: string; label: string }>
    filters: {
        event?: string
        model?: string
        user_id?: string
        from_date?: string
        to_date?: string
        search?: string
    }
}

export default function Index({ logs, events, models, filters }: Props) {
    const { t } = useTranslation()
    const [localFilters, setLocalFilters] = useState(filters)

    const applyFilters = () => {
        router.get(route('audit-logs.index'), localFilters, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const clearFilters = () => {
        setLocalFilters({})
        router.get(route('audit-logs.index'), {}, {
            preserveState: true,
        })
    }

    const getEventBadgeVariant = (event: string) => {
        switch (event) {
            case 'created':
                return 'default'
            case 'updated':
                return 'secondary'
            case 'deleted':
                return 'destructive'
            case 'role_changed':
            case 'permissions_synced':
                return 'outline'
            default:
                return 'secondary'
        }
    }

    const handleExport = () => {
        window.location.href = route('audit-logs.export', localFilters)
    }

    return (
        <DashboardLayout header={t('auditLog.title', 'Audit Logs')}>
            <Head title={t('auditLog.title', 'Audit Logs')} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{t('auditLog.title', 'Audit Logs')}</h2>
                        <p className="text-muted-foreground">
                            {t('auditLog.description', 'View all system activity and changes')}
                        </p>
                    </div>
                    <Button onClick={handleExport} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        {t('auditLog.export', 'Export')}
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            {t('auditLog.filters', 'Filters')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            <div className="space-y-2">
                                <Label>{t('auditLog.event', 'Event')}</Label>
                                <Select
                                    value={localFilters.event || ''}
                                    onValueChange={(value) => setLocalFilters({ ...localFilters, event: value || undefined })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('auditLog.allEvents', 'All Events')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {events.map((event) => (
                                            <SelectItem key={event.value} value={event.value}>
                                                {event.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('auditLog.model', 'Model')}</Label>
                                <Select
                                    value={localFilters.model || ''}
                                    onValueChange={(value) => setLocalFilters({ ...localFilters, model: value || undefined })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('auditLog.allModels', 'All Models')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {models.map((model) => (
                                            <SelectItem key={model.value} value={model.value}>
                                                {model.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('auditLog.fromDate', 'From Date')}</Label>
                                <Input
                                    type="date"
                                    value={localFilters.from_date || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, from_date: e.target.value || undefined })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('auditLog.toDate', 'To Date')}</Label>
                                <Input
                                    type="date"
                                    value={localFilters.to_date || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, to_date: e.target.value || undefined })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('auditLog.search', 'Search')}</Label>
                                <Input
                                    type="text"
                                    placeholder={t('auditLog.searchPlaceholder', 'Search values...')}
                                    value={localFilters.search || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value || undefined })}
                                />
                            </div>

                            <div className="flex items-end gap-2">
                                <Button onClick={applyFilters}>{t('auditLog.apply', 'Apply')}</Button>
                                <Button variant="outline" onClick={clearFilters}>{t('auditLog.clear', 'Clear')}</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('auditLog.dateTime', 'Date/Time')}</TableHead>
                                    <TableHead>{t('auditLog.user', 'User')}</TableHead>
                                    <TableHead>{t('auditLog.event', 'Event')}</TableHead>
                                    <TableHead>{t('auditLog.model', 'Model')}</TableHead>
                                    <TableHead>{t('auditLog.recordId', 'Record ID')}</TableHead>
                                    <TableHead>{t('auditLog.ipAddress', 'IP Address')}</TableHead>
                                    <TableHead className="w-[80px]">{t('auditLog.actions', 'Actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            {t('auditLog.noLogs', 'No audit logs found')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.data.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-mono text-sm">
                                                {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                                            </TableCell>
                                            <TableCell>
                                                {log.user ? (
                                                    <div>
                                                        <div className="font-medium">{log.user.name}</div>
                                                        <div className="text-sm text-muted-foreground">{log.user.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">{t('auditLog.system', 'System')}</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getEventBadgeVariant(log.event)}>
                                                    {log.event_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{log.model_name}</TableCell>
                                            <TableCell className="font-mono text-sm">{log.auditable_id}</TableCell>
                                            <TableCell className="font-mono text-sm">{log.ip_address}</TableCell>
                                            <TableCell>
                                                <Button asChild size="sm" variant="ghost">
                                                    <Link href={route('audit-logs.show', log.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div className="flex items-center justify-between px-2">
                        <p className="text-sm text-muted-foreground">
                            {t('auditLog.showing', 'Showing {{from}} to {{to}} of {{total}} entries', {
                                from: (logs.current_page - 1) * logs.per_page + 1,
                                to: Math.min(logs.current_page * logs.per_page, logs.total),
                                total: logs.total,
                            })}
                        </p>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get(route('audit-logs.index', { ...filters, page: logs.current_page - 1 }))}
                                disabled={logs.current_page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">
                                {t('auditLog.page', 'Page {{current}} of {{last}}', {
                                    current: logs.current_page,
                                    last: logs.last_page,
                                })}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get(route('audit-logs.index', { ...filters, page: logs.current_page + 1 }))}
                                disabled={logs.current_page === logs.last_page}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
