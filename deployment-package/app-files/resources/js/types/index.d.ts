export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    is_super_admin?: boolean;
    status?: 'active' | 'inactive' | 'banned' | 'pending';
    banned_at?: string;
    ban_reason?: string;
    last_login_at?: string;
    last_login_ip?: string;
    admin_notes?: string;
}

export interface Tenant {
    id: number;
    name: string;
}

export interface Role {
    id: number;
    name: string;
    slug: string;
}

export interface SubscriptionPlan {
    id: number;
    code: string;
    name: string;
    description?: string;
    price_monthly: number;
    price_yearly: number;
    max_tenants: number;
    max_users_per_tenant: number;
    max_invoices_per_month?: number;
    features?: string[];
    is_active: boolean;
    sort_order: number;
}

export interface UserSubscription {
    id: number;
    plan: string;
    status: 'active' | 'cancelled' | 'expired' | 'suspended';
    billing_cycle: 'monthly' | 'yearly';
    starts_at: string;
    ends_at?: string;
    cancelled_at?: string;
}

export interface PaymentGateway {
    id: number;
    code: string;
    name: string;
    description?: string;
    is_active: boolean;
    is_sandbox: boolean;
    config?: Record<string, any>;
    supported_currencies?: string[];
    min_amount?: number;
    max_amount?: number;
}

export interface PaymentTransaction {
    id: number;
    user?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
    type: 'subscription' | 'one_time' | 'refund';
    gateway_code: string;
    paid_at?: string;
    created_at: string;
}

export type Permission =
    | 'sales.view' | 'sales.create' | 'sales.edit' | 'sales.delete' | 'sales.approve'
    | 'purchases.view' | 'purchases.create' | 'purchases.edit' | 'purchases.delete' | 'purchases.approve'
    | 'accounting.view' | 'accounting.create' | 'accounting.edit' | 'accounting.delete' | 'accounting.approve'
    | 'inventory.view' | 'inventory.create' | 'inventory.edit' | 'inventory.delete'
    | 'reports.view' | 'reports.export'
    | 'settings.view' | 'settings.edit'
    | 'users.view' | 'users.create' | 'users.edit' | 'users.delete'
    | 'audit-log.view' | 'audit-log.export';

export interface AuthData {
    user: User;
    current_tenant: Tenant | null;
    tenants: Tenant[];
    role: Role | null;
    permissions: Permission[];
    is_super_admin: boolean;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: AuthData;
    flash: {
        success?: string;
        error?: string;
    };
};
