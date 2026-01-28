import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head, Link } from "@inertiajs/react"
import { useTranslation } from "react-i18next"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { ArrowLeft, Clock, User, Globe, Monitor, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
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
    user_agent: string | null
    created_at: string
}

interface Props {
    log: AuditLog
}

export default function Show({ log }: Props) {
    const { t } = useTranslation()

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

    const renderValue = (value: any): string => {
        if (value === null || value === undefined) return '-'
        if (typeof value === 'boolean') return value ? 'Yes' : 'No'
        if (typeof value === 'object') return JSON.stringify(value, null, 2)
        return String(value)
    }

    const getChangedFields = () => {
        if (!log.old_values && !log.new_values) return []

        const allKeys = new Set([
            ...Object.keys(log.old_values || {}),
            ...Object.keys(log.new_values || {}),
        ])

        return Array.from(allKeys)
            .filter(key => !['updated_at', 'created_at'].includes(key))
            .map(key => ({
                field: key,
                oldValue: log.old_values?.[key],
                newValue: log.new_values?.[key],
            }))
    }

    const changedFields = getChangedFields()

    return (
        <DashboardLayout header={t('auditLog.detail', 'Audit Log Detail')}>
            <Head title={t('auditLog.detail', 'Audit Log Detail')} />

            <div className="flex-1 space-y-6 p-8 pt-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={route('audit-logs.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('auditLog.back', 'Back to Logs')}
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Event Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {t('auditLog.eventInfo', 'Event Information')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{t('auditLog.event', 'Event')}</span>
                                <Badge variant={getEventBadgeVariant(log.event)}>
                                    {log.event_label}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{t('auditLog.model', 'Model')}</span>
                                <span className="font-mono text-sm">{log.model_name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{t('auditLog.recordId', 'Record ID')}</span>
                                <span className="font-mono text-sm">{log.auditable_id}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {t('auditLog.dateTime', 'Date/Time')}
                                </span>
                                <span className="font-mono text-sm">
                                    {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User & Request Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {t('auditLog.requestInfo', 'Request Information')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{t('auditLog.user', 'User')}</span>
                                {log.user ? (
                                    <div className="text-right">
                                        <div className="font-medium">{log.user.name}</div>
                                        <div className="text-sm text-muted-foreground">{log.user.email}</div>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">{t('auditLog.system', 'System')}</span>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    {t('auditLog.ipAddress', 'IP Address')}
                                </span>
                                <span className="font-mono text-sm">{log.ip_address || '-'}</span>
                            </div>
                            {log.user_agent && (
                                <div className="space-y-2">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Monitor className="h-4 w-4" />
                                        {t('auditLog.userAgent', 'User Agent')}
                                    </span>
                                    <p className="text-sm text-muted-foreground break-all bg-muted p-2 rounded">
                                        {log.user_agent}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Changes */}
                {changedFields.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('auditLog.changes', 'Changes')}</CardTitle>
                            <CardDescription>
                                {t('auditLog.changesDescription', 'Comparison of old and new values')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {changedFields.map((field) => (
                                    <div key={field.field} className="border rounded-lg p-4">
                                        <div className="font-medium mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                                            {field.field.replace(/_/g, ' ')}
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground uppercase">
                                                    {t('auditLog.oldValue', 'Old Value')}
                                                </div>
                                                <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded font-mono text-sm whitespace-pre-wrap">
                                                    {renderValue(field.oldValue)}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground uppercase">
                                                    {t('auditLog.newValue', 'New Value')}
                                                </div>
                                                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded font-mono text-sm whitespace-pre-wrap">
                                                    {renderValue(field.newValue)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Raw Data (for debugging) */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('auditLog.rawData', 'Raw Data')}</CardTitle>
                        <CardDescription>
                            {t('auditLog.rawDataDescription', 'Complete audit log entry in JSON format')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            {log.old_values && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">{t('auditLog.oldValues', 'Old Values')}</div>
                                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                                        {JSON.stringify(log.old_values, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {log.new_values && (
                                <div className="space-y-2">
                                    <div className="text-sm font-medium">{t('auditLog.newValues', 'New Values')}</div>
                                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                                        {JSON.stringify(log.new_values, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
