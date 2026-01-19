<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Free Plan
        SubscriptionPlan::updateOrCreate(
            ['code' => 'free'],
            [
                'name' => 'Free',
                'description' => 'Get started with basic accounting features',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'max_tenants' => 1,
                'max_users_per_tenant' => 1,
                'max_invoices_per_month' => 10,
                'features' => [
                    'Basic accounting',
                    '1 company',
                    '10 invoices/month',
                    'Basic reports',
                ],
                'is_active' => true,
                'sort_order' => 0,
            ]
        );

        // Basic Plan
        SubscriptionPlan::updateOrCreate(
            ['code' => 'basic'],
            [
                'name' => 'Basic',
                'description' => 'Perfect for small businesses',
                'price_monthly' => 49,
                'price_yearly' => 470,
                'max_tenants' => 3,
                'max_users_per_tenant' => 3,
                'max_invoices_per_month' => 100,
                'features' => [
                    'Full accounting features',
                    '2 companies',
                    '3 users per company',
                    '100 invoices/month',
                    'All reports',
                    'Email support',
                ],
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        // Professional Plan
        SubscriptionPlan::updateOrCreate(
            ['code' => 'pro'],
            [
                'name' => 'Professional',
                'description' => 'For growing businesses',
                'price_monthly' => 99,
                'price_yearly' => 950,
                'max_tenants' => 5,
                'max_users_per_tenant' => 10,
                'max_invoices_per_month' => 500,
                'features' => [
                    'Everything in Basic',
                    '5 companies',
                    '10 users per company',
                    '500 invoices/month',
                    'e-Invoice integration',
                    'Priority support',
                    'API access',
                ],
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        // Enterprise Plan
        SubscriptionPlan::updateOrCreate(
            ['code' => 'enterprise'],
            [
                'name' => 'Enterprise',
                'description' => 'For large organizations',
                'price_monthly' => 249,
                'price_yearly' => 2390,
                'max_tenants' => 20,
                'max_users_per_tenant' => 50,
                'max_invoices_per_month' => null, // Unlimited
                'features' => [
                    'Everything in Professional',
                    '20 companies',
                    '50 users per company',
                    'Unlimited invoices',
                    'Custom integrations',
                    'Dedicated support',
                    'SLA guarantee',
                    'Training & onboarding',
                ],
                'is_active' => true,
                'sort_order' => 3,
            ]
        );
    }
}
