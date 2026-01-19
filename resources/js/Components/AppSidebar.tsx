import * as React from "react"
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Command,
    Frame,
    GalleryVerticalEnd,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
    LayoutDashboard,
    ShoppingCart,
    Package,
    FileText,
    CreditCard,
    Users,
    Briefcase,
    Calculator,
    ChevronRight,
    Receipt,
    Building2,
} from "lucide-react"

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
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/Components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/Components/ui/collapsible"
import { Link, usePage } from "@inertiajs/react"
import { Separator } from "@/Components/ui/separator"
import { TenantSwitcher } from "./TenantSwitcher"
import { NavUser } from "./NavUser"
import { usePermissions } from "@/hooks/use-permissions"


// ... existing imports ...
import { useTranslation } from "react-i18next"; // Create a new import line or add to existing if possible, but here separate is safer
import type { Permission } from "@/types";

// Types for menu items
interface SubMenuItem {
    title: string;
    url: string;
    permission?: Permission;
}

interface MenuItem {
    title: string;
    url: string;
    icon: React.ElementType;
    permission?: Permission;
    isActive?: boolean;
    items?: SubMenuItem[];
}

// ...

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { t } = useTranslation();
    const { url, props: pageProps } = usePage<any>();
    const user = pageProps.auth.user;
    const { can, canAccessModule } = usePermissions();

    // Menu items with permission requirements
    const items = {
        main: [
            {
                title: t('nav.dashboard'),
                url: "/dashboard",
                icon: LayoutDashboard,
            },
            {
                title: t('nav.sales'),
                url: "/sales",
                icon: ShoppingCart,
                permission: 'sales.view' as Permission,
                isActive: true,
                items: [
                    { title: t('sales.quotations'), url: "/sales/quotations", permission: 'sales.view' as Permission },
                    { title: t('sales.invoices'), url: "/sales/invoices", permission: 'sales.view' as Permission },
                    { title: t('sales.receipts'), url: "/sales/receipts", permission: 'sales.view' as Permission },
                    { title: t('sales.creditNotes'), url: "/sales/credit-notes", permission: 'sales.view' as Permission },
                    { title: t('sales.deliveryOrders'), url: "/sales/delivery-orders", permission: 'sales.view' as Permission },
                    { title: t('sales.customers'), url: "/sales/customers", permission: 'sales.view' as Permission },
                ],
            },
            {
                title: t('nav.purchases'),
                url: "/purchase",
                icon: Package,
                permission: 'purchases.view' as Permission,
                items: [
                    { title: t('purchases.bills'), url: "/purchase/invoices", permission: 'purchases.view' as Permission },
                    { title: t('purchases.expenses'), url: "/purchase/expenses", permission: 'purchases.view' as Permission },
                    { title: t('purchases.payments'), url: "/purchase/payments", permission: 'purchases.view' as Permission },
                    { title: t('purchases.suppliers'), url: "/purchase/suppliers", permission: 'purchases.view' as Permission },
                    { title: t('purchases.expenseCategories'), url: "/purchase/expense-categories", permission: 'purchases.view' as Permission },
                ],
            },
            {
                title: t('nav.accounting'),
                url: "/accounting",
                icon: Calculator,
                permission: 'accounting.view' as Permission,
                items: [
                    { title: t('accounting.journalEntries'), url: "/accounting/journals", permission: 'accounting.view' as Permission },
                    { title: t('accounting.generalLedger'), url: "/accounting/general-ledger", permission: 'accounting.view' as Permission },
                    { title: t('accounting.chartOfAccounts'), url: "/accounting/coa", permission: 'accounting.view' as Permission },
                    { title: t('accounting.cashbook'), url: "/accounting/cashbook", permission: 'accounting.view' as Permission },
                    { title: t('accounting.reconciliation'), url: "/accounting/bank-accounts", permission: 'accounting.view' as Permission },
                ],
            },
            {
                title: t('nav.inventory'),
                url: "/inventory",
                icon: Briefcase,
                permission: 'inventory.view' as Permission,
                items: [
                    { title: t('nav.products'), url: "/inventory/products", permission: 'inventory.view' as Permission },
                    { title: t('nav.categories'), url: "/inventory/categories", permission: 'inventory.view' as Permission },
                    { title: t('nav.stockMovements'), url: "/inventory/movements", permission: 'inventory.view' as Permission },
                ],
            },
            {
                title: t('nav.einvoice'),
                url: "/einvoice",
                icon: Receipt,
                permission: 'sales.view' as Permission,
            },
        ] as MenuItem[],
        system: [
            {
                title: t('nav.reports'),
                url: "/reports",
                icon: FileText,
                permission: 'reports.view' as Permission,
            },
            {
                title: t('nav.auditLogs'),
                url: "/audit-logs",
                icon: FileText,
                permission: 'audit-log.view' as Permission,
            },
            {
                title: t('nav.companies'),
                url: "/companies",
                icon: Building2,
            },
            {
                title: t('nav.userManagement'),
                url: "/master/users",
                icon: Users,
                permission: 'users.view' as Permission,
            },
        ] as MenuItem[],
    }

    // Filter menu items based on permissions
    const filterMenuItems = (menuItems: MenuItem[]): MenuItem[] => {
        return menuItems
            .filter(item => !item.permission || can(item.permission))
            .map(item => ({
                ...item,
                items: item.items?.filter(subItem => !subItem.permission || can(subItem.permission))
            }))
            .filter(item => !item.items || item.items.length > 0);
    };

    const filteredMain = filterMenuItems(items.main);
    const filteredSystem = filterMenuItems(items.system);

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TenantSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredMain.map((item) => (
                                <Collapsible
                                    key={item.title}
                                    asChild
                                    defaultOpen={url.startsWith(item.url)}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        {item.items && item.items.length > 0 ? (
                                            <>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton tooltip={item.title} isActive={url.startsWith(item.url)}>
                                                        <item.icon />
                                                        <span>{item.title}</span>
                                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.items.map((subItem) => (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton asChild isActive={url === subItem.url}>
                                                                    <Link href={subItem.url}>
                                                                        <span>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </>
                                        ) : (
                                            <SidebarMenuButton asChild isActive={url.startsWith(item.url)}>
                                                <Link href={item.url}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        )}
                                    </SidebarMenuItem>
                                </Collapsible>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <Separator className="my-2" />

                <SidebarGroup>
                    <SidebarGroupLabel>System</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredSystem.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={url.startsWith(item.url)}>
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
                    © 2026 BukuKira
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar >
    )
}
