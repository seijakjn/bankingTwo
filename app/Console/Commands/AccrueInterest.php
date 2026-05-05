<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Account;
use App\Models\Interest;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AccrueInterest extends Command
{
    protected $signature = 'bank:accrue-interest';
    protected $description = 'Accrue daily interest to user accounts based on balance tiers';

    public function handle()
    {
        $today = Carbon::today()->toDateString();

        // Interest tiers (annual %)
        // $100k+ → 3.5% APY
        // $10k+  → 2.5% APY
        // $1k+   → 1.5% APY
        // Under  → 0.5% APY
        $tiers = [
            ['min' => 100000, 'apy' => 0.035],
            ['min' => 10000,  'apy' => 0.025],
            ['min' => 1000,   'apy' => 0.015],
            ['min' => 0,      'apy' => 0.005],
        ];

        $accounts = Account::whereHas('user', function ($q) {
            $q->where('role', 'user');
        })->get();

        $count = 0;

        foreach ($accounts as $account) {
            $balance = (float) $account->balance;
            if ($balance <= 0) continue;

            // Prevent double accrual on same day
            $alreadyAccrued = Interest::where('account_id', $account->id)
                ->where('accrual_date', $today)
                ->exists();
            if ($alreadyAccrued) continue;

            // Find the applicable tier
            $apy = 0.005;
            foreach ($tiers as $tier) {
                if ($balance >= $tier['min']) {
                    $apy = $tier['apy'];
                    break;
                }
            }

            // Daily rate = APY / 365
            $dailyInterest = round($balance * ($apy / 365), 2);
            if ($dailyInterest <= 0) continue;

            DB::transaction(function () use ($account, $dailyInterest, $today) {
                Interest::create([
                    'account_id'   => $account->id,
                    'accrual_date' => $today,
                    'amount'       => $dailyInterest,
                ]);

                $account->balance = $account->balance + $dailyInterest;
                $account->save();
            });

            $count++;
        }

        $this->info("Interest accrued for {$count} account(s) on {$today}.");
        return 0;
    }
}
