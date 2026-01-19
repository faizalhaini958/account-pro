import DashboardLayout from "@/Layouts/DashboardLayout"
import { Head } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { useTranslation } from "react-i18next"

export default function Index() {
    const { t } = useTranslation()

    return (
        <DashboardLayout header={t('nav.stockMovements')}>
            <Head title={t('nav.stockMovements')} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{t('nav.stockMovements')}</h2>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('nav.stockMovements')}</CardTitle>
                        <CardDescription>
                            Coming Soon. This module is currently under development.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Track inventory stock movements here.</p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
