<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user()->load(['accounts.transactions' => function ($query) {
            $query->latest()->take(10);
        }]);

        return Inertia::render('Dashboard', [
            'account' => $user->accounts->first(),
            'recentTransactions' => $user->accounts->first() ? $user->accounts->first()->transactions : []
        ]);
    }
}
