<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = \App\Models\User::firstOrCreate(
            ['email' => 'admin@vault.com'],
            [
                'name' => 'Vault Admin',
                'clerk_id' => 'admin_mock_id',
                'role' => 'admin',
                'password' => null,
            ]
        );

        $branch = \App\Models\User::firstOrCreate(
            ['email' => 'branch_main@vault.com'],
            [
                'name' => 'Main Branch',
                'clerk_id' => 'branch_mock_id',
                'role' => 'branch',
                'password' => null,
            ]
        );

        if ($branch->accounts()->count() === 0) {
            $branch->accounts()->create([
                'account_number' => 'VAULT-MASTER',
                'balance' => 1000000000.00 // 1 Billion
            ]);
        }
    }
}
