<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        if ($user->role === 'branch') {
            return redirect()->route('branch.dashboard');
        }

        $user->load(['accounts.transactions' => function ($query) {
            $query->latest()->take(10);
        }]);

        $account = $user->accounts->first();

        // Interest tier for display
        $balance = $account ? (float) $account->balance : 0;
        $interestTier = match(true) {
            $balance >= 100000 => ['apy' => '3.5%', 'label' => 'Platinum'],
            $balance >= 10000  => ['apy' => '2.5%', 'label' => 'Gold'],
            $balance >= 1000   => ['apy' => '1.5%', 'label' => 'Silver'],
            default            => ['apy' => '0.5%', 'label' => 'Standard'],
        };

        return Inertia::render('Dashboard', [
            'account'            => $account,
            'recentTransactions' => $account ? $account->transactions : [],
            'activeLoans'        => $user->loans()->whereIn('status', ['approved'])->get(),
            'interestTier'       => $interestTier,
        ]);
    }
}
