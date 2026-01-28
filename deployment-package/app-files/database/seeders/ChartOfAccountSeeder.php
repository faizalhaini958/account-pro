<?php

namespace Database\Seeders;

use App\Models\ChartOfAccount;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class ChartOfAccountSeeder extends Seeder
{
    public function run(): void
    {
        // This seeder should be run within a tenant scope or loop through tenants
        // For default seeding, we'll get the first tenant
        $tenant = Tenant::first();
        
        if (!$tenant) return;

        // Ensure we are scoping to this tenant
        // In a real app, this logic might be in a Service class called by the seeder
        
        $coa = [
            // Assets
            ['code' => '1000', 'name' => 'ASSETS', 'type' => 'asset', 'subtype' => null],
            ['code' => '1100', 'name' => 'Current Assets', 'type' => 'asset', 'subtype' => 'current_asset', 'parent_code' => '1000'],
            ['code' => '1101', 'name' => 'Cash in Hand', 'type' => 'asset', 'subtype' => 'current_asset', 'parent_code' => '1100'],
            ['code' => '1102', 'name' => 'Maybank Current Account', 'type' => 'asset', 'subtype' => 'current_asset', 'parent_code' => '1100'],
            ['code' => '1103', 'name' => 'CIMB Current Account', 'type' => 'asset', 'subtype' => 'current_asset', 'parent_code' => '1100'],
            ['code' => '1200', 'name' => 'Accounts Receivable', 'type' => 'asset', 'subtype' => 'current_asset', 'parent_code' => '1100'],
            ['code' => '1300', 'name' => 'Inventory', 'type' => 'asset', 'subtype' => 'current_asset', 'parent_code' => '1100'],
            
            // Fixed Assets
            ['code' => '1500', 'name' => 'Fixed Assets', 'type' => 'asset', 'subtype' => 'fixed_asset', 'parent_code' => '1000'],
            ['code' => '1501', 'name' => 'Office Equipment', 'type' => 'asset', 'subtype' => 'fixed_asset', 'parent_code' => '1500'],
            ['code' => '1502', 'name' => 'Computers & Software', 'type' => 'asset', 'subtype' => 'fixed_asset', 'parent_code' => '1500'],
            
            // Liabilities
            ['code' => '2000', 'name' => 'LIABILITIES', 'type' => 'liability', 'subtype' => null],
            ['code' => '2100', 'name' => 'Current Liabilities', 'type' => 'liability', 'subtype' => 'current_liability', 'parent_code' => '2000'],
            ['code' => '2101', 'name' => 'Accounts Payable', 'type' => 'liability', 'subtype' => 'current_liability', 'parent_code' => '2100'],
            ['code' => '2102', 'name' => 'SST Payable', 'type' => 'liability', 'subtype' => 'current_liability', 'parent_code' => '2100'],
            
            // Equity
            ['code' => '3000', 'name' => 'EQUITY', 'type' => 'equity', 'subtype' => 'equity'],
            ['code' => '3001', 'name' => 'Capital', 'type' => 'equity', 'subtype' => 'equity', 'parent_code' => '3000'],
            ['code' => '3002', 'name' => 'Retained Earnings', 'type' => 'equity', 'subtype' => 'equity', 'parent_code' => '3000'],
            
            // Income
            ['code' => '4000', 'name' => 'REVENUE', 'type' => 'income', 'subtype' => 'revenue'],
            ['code' => '4001', 'name' => 'Sales - Goods', 'type' => 'income', 'subtype' => 'revenue', 'parent_code' => '4000'],
            ['code' => '4002', 'name' => 'Sales - Services', 'type' => 'income', 'subtype' => 'revenue', 'parent_code' => '4000'],
            ['code' => '4003', 'name' => 'Sales Discount', 'type' => 'income', 'subtype' => 'revenue', 'parent_code' => '4000'],
            
            // Expenses
            ['code' => '5000', 'name' => 'COST OF GOODS SOLD', 'type' => 'cogs', 'subtype' => 'cogs'],
            ['code' => '5001', 'name' => 'Cost of Goods Sold', 'type' => 'cogs', 'subtype' => 'cogs', 'parent_code' => '5000'],
            
            ['code' => '6000', 'name' => 'OPERATING EXPENSES', 'type' => 'expense', 'subtype' => 'operating_expense'],
            ['code' => '6001', 'name' => 'Advertising & Marketing', 'type' => 'expense', 'subtype' => 'operating_expense', 'parent_code' => '6000'],
            ['code' => '6002', 'name' => 'Bank Fees', 'type' => 'expense', 'subtype' => 'operating_expense', 'parent_code' => '6000'],
            ['code' => '6003', 'name' => 'General & Administrative', 'type' => 'expense', 'subtype' => 'operating_expense', 'parent_code' => '6000'],
            ['code' => '6004', 'name' => 'Rent Expense', 'type' => 'expense', 'subtype' => 'operating_expense', 'parent_code' => '6000'],
            ['code' => '6005', 'name' => 'Salary & Wages', 'type' => 'expense', 'subtype' => 'operating_expense', 'parent_code' => '6000'],
            ['code' => '6006', 'name' => 'Utilities', 'type' => 'expense', 'subtype' => 'operating_expense', 'parent_code' => '6000'],
        ];

        foreach ($coa as $account) {
            $parent = isset($account['parent_code']) 
                ? ChartOfAccount::where('code', $account['parent_code'])->where('tenant_id', $tenant->id)->first() 
                : null;

            ChartOfAccount::firstOrCreate(
                [
                    'code' => $account['code'],
                    'tenant_id' => $tenant->id
                ],
                [
                    'name' => $account['name'],
                    'type' => $account['type'],
                    'subtype' => $account['subtype'],
                    'parent_id' => $parent ? $parent->id : null,
                    'is_system' => true,
                    'is_active' => true,
                ]
            );
        }
    }
}
