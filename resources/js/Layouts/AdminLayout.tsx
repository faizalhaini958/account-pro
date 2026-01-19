import { AppSidebar } from "@/Components/AppSidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/Components/ui/sidebar";
import { Link, usePage } from "@inertiajs/react";
import { PropsWithChildren, ReactNode } from "react";
import { Toaster } from "@/Components/ui/toaster";
import { ModeToggle } from "@/Components/ModeToggle";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    LayoutDashboard,
    Users,
    Settings,
    CreditCard,
    Mail,
    Package,
    ChevronRight,
    Shield,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/Components/ui/sidebar";
import { NavUser } from "@/Components/NavUser";

interface AdminLayoutProps {
    header?: string | ReactNode;
}

function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { url, props: pageProps } = usePage<any>();
    const user = pageProps.auth.user;

    const menuItems = [
        {
            title: "Dashboard",
            url: "/admin",
            icon: LayoutDashboard,
        },
        {
            title: "Subscriptions",
            url: "/admin/subscriptions",
            icon: CreditCard,
        },
        {
            title: "User Management",
            url: "/admin/users",
            icon: Users,
        },
        {
            title: "Subscription Plans",
            url: "/admin/subscription-plans",
            icon: Package,
        },
    ];

    const settingsItems = [
        {
            title: "SMTP / Email",
            url: "/admin/settings/smtp",
            icon: Mail,
        },
        {
            title: "Payment Gateways",
            url: "/admin/settings/payment-gateways",
            icon: CreditCard,
        },
    ];

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Shield className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Admin Panel</span>
                                    <span className="truncate text-xs text-muted-foreground">Super Admin</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={url === item.url || url.startsWith(item.url + '/')}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <Separator className="my-2" />

                <SidebarGroup>
                    <SidebarGroupLabel>Settings</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {settingsItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={url === item.url || url.startsWith(item.url + '/')}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
                <div className="p-4 text-xs text-muted-foreground text-center">
                    © 2026 BukuKira Admin
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}

export default function AdminLayout({ children, header }: PropsWithChildren<AdminLayoutProps>) {
    const { props: pageProps } = usePage<any>();
    const isImpersonating = pageProps.impersonating;

    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                {isImpersonating && (
                    <div className="bg-warning text-warning-foreground px-4 py-2 text-center text-sm">
                        You are currently impersonating a user.{" "}
                        <Link
                            href={route('stop-impersonating')}
                            method="post"
                            as="button"
                            className="underline font-medium"
                        >
                            Stop Impersonating
                        </Link>
                    </div>
                )}
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/admin">
                                        Admin Panel
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
                        <Badge variant="outline" className="hidden sm:inline-flex">
                            <Shield className="mr-1 h-3 w-3" />
                            Super Admin
                        </Badge>
                        <ModeToggle />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    );
}
