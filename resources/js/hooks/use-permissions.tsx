import { usePage } from '@inertiajs/react';
import { PageProps, Permission } from '@/types';

/**
 * Hook for checking user permissions in React components
 */
export function usePermissions() {
    const { auth } = usePage<PageProps>().props;

    const permissions = auth.permissions || [];
    const isSuperAdmin = auth.is_super_admin || false;
    const role = auth.role;

    /**
     * Check if user has a specific permission
     */
    const can = (permission: Permission): boolean => {
        if (isSuperAdmin) return true;
        return permissions.includes(permission);
    };

    /**
     * Check if user has any of the given permissions
     */
    const canAny = (perms: Permission[]): boolean => {
        if (isSuperAdmin) return true;
        return perms.some(p => permissions.includes(p));
    };

    /**
     * Check if user has all of the given permissions
     */
    const canAll = (perms: Permission[]): boolean => {
        if (isSuperAdmin) return true;
        return perms.every(p => permissions.includes(p));
    };

    /**
     * Check if user cannot perform an action
     */
    const cannot = (permission: Permission): boolean => {
        return !can(permission);
    };

    /**
     * Check if user has a specific role
     */
    const hasRole = (roleSlug: string): boolean => {
        if (isSuperAdmin) return true;
        return role?.slug === roleSlug;
    };

    /**
     * Check if user has any of the given roles
     */
    const hasAnyRole = (roleSlugs: string[]): boolean => {
        if (isSuperAdmin) return true;
        return role ? roleSlugs.includes(role.slug) : false;
    };

    /**
     * Check module-level access
     */
    const canAccessModule = (module: 'sales' | 'purchases' | 'accounting' | 'inventory' | 'reports' | 'settings' | 'users'): boolean => {
        if (isSuperAdmin) return true;
        return permissions.some(p => p.startsWith(`${module}.`));
    };

    return {
        permissions,
        role,
        isSuperAdmin,
        can,
        canAny,
        canAll,
        cannot,
        hasRole,
        hasAnyRole,
        canAccessModule,
    };
}

/**
 * Helper component for conditional rendering based on permissions
 */
export function Can({
    permission,
    children,
    fallback = null
}: {
    permission: Permission;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    const { can } = usePermissions();
    return can(permission) ? <>{children}</> : <>{fallback}</>;
}

/**
 * Helper component for conditional rendering based on any of multiple permissions
 */
export function CanAny({
    permissions,
    children,
    fallback = null
}: {
    permissions: Permission[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    const { canAny } = usePermissions();
    return canAny(permissions) ? <>{children}</> : <>{fallback}</>;
}

/**
 * Helper component for role-based conditional rendering
 */
export function HasRole({
    role,
    children,
    fallback = null
}: {
    role: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    const { hasRole } = usePermissions();
    return hasRole(role) ? <>{children}</> : <>{fallback}</>;
}
