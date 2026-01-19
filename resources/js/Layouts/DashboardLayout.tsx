import { AppSidebar } from "@/Components/AppSidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb"
import { Separator } from "@/Components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/Components/ui/sidebar"
import { Head, usePage } from "@inertiajs/react"
import { PropsWithChildren, ReactNode } from "react"
import { Toaster } from "@/Components/ui/toaster"
import { LanguageSwitcher } from "@/Components/LanguageSwitcher"
import { ModeToggle } from "@/Components/ModeToggle"

import { useTranslation } from "react-i18next"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

import TrialBanner from "@/Components/TrialBanner"
import TrialExpiredModal from "@/Components/TrialExpiredModal"

export default function DashboardLayout({ children, header }: PropsWithChildren<{ header?: string | ReactNode }>) {
    const { t } = useTranslation();
    const { toast } = useToast()
    const { props } = usePage<any>()
    const { flash } = props

    useEffect(() => {
        if (flash?.success) {
            toast({
                title: "Success",
                description: flash.success,
                variant: "default",
            })
        }
        if (flash?.error) {
            toast({
                title: "Error",
                description: flash.error,
                variant: "destructive",
            })
        }
    }, [flash, toast, t])

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <TrialBanner />
                <TrialExpiredModal />
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard">
                                        {t('nav.dashboard')}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                {header && (
                                    <>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>{header}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                )}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="ml-auto px-4 flex items-center gap-2">
                        <ModeToggle />
                        <LanguageSwitcher />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    )
}
