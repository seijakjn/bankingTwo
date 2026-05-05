<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Account;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $account = $user->accounts()->first();
        $transactions = $account ? $account->transactions()->latest()->get() : [];

        // Get recent contacts from outgoing transfers
        $recentContactIds = $account
            ? $account->transactions()
                ->where('type', 'transfer_out')
                ->whereNotNull('target_account_id')
                ->latest()
                ->pluck('target_account_id')
                ->unique()
                ->take(5)
            : collect();

        $recentContacts = \App\Models\Account::whereIn('id', $recentContactIds)
            ->with('user:id,name,first_name,last_name')
            ->get()
            ->map(fn ($acc) => [
                'account_number' => $acc->account_number,
                'name' => trim(($acc->user->first_name ?? '') . ' ' . ($acc->user->last_name ?? '')) ?: $acc->user->name,
            ]);

        return Inertia::render('Transactions', [
            'account'        => $account,
            'transactions'   => $transactions,
            'recentContacts' => $recentContacts,
        ]);
    }

    public function deposit(Request $request)
    {
        if ($request->user()->is_frozen) return back()->withErrors(['error' => 'Account frozen.']);
        $request->validate(['amount' => 'required|numeric|min:1']);
        $account = $request->user()->accounts()->first();
        $branch = \App\Models\User::where('role', 'branch')->first();
        $branchAccount = $branch->accounts()->first();

        DB::transaction(function () use ($account, $branchAccount, $request) {
            $branchAccount->balance -= $request->amount;
            $branchAccount->save();

            $account->balance += $request->amount;
            $account->save();

            $account->transactions()->create([
                'type' => 'deposit',
                'amount' => $request->amount,
                'status' => 'completed'
            ]);
            
            // Log the matching transaction for the branch
            $branchAccount->transactions()->create([
                'type' => 'transfer_out',
                'target_account_id' => $account->id,
                'amount' => $request->amount,
                'status' => 'completed'
            ]);
        });

        return back()->with('success', 'Deposit successful');
    }

    public function withdraw(Request $request)
    {
        if ($request->user()->is_frozen) return back()->withErrors(['error' => 'Account frozen.']);
        $request->validate(['amount' => 'required|numeric|min:1']);
        $account = $request->user()->accounts()->first();
        $branch = \App\Models\User::where('role', 'branch')->first();
        $branchAccount = $branch->accounts()->first();

        if ($account->balance < $request->amount) {
            return back()->withErrors(['amount' => 'Insufficient funds']);
        }

        DB::transaction(function () use ($account, $branchAccount, $request) {
            $account->balance -= $request->amount;
            $account->save();

            $branchAccount->balance += $request->amount;
            $branchAccount->save();

            $account->transactions()->create([
                'type' => 'withdraw',
                'amount' => $request->amount,
                'status' => 'completed'
            ]);

            // Log the matching transaction for the branch
            $branchAccount->transactions()->create([
                'type' => 'transfer_in',
                'target_account_id' => $account->id,
                'amount' => $request->amount,
                'status' => 'completed'
            ]);
        });

        return back()->with('success', 'Withdrawal successful');
    }

    public function transfer(Request $request)
    {
        if ($request->user()->is_frozen) return back()->withErrors(['error' => 'Account frozen.']);
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'target_account_number' => 'required|exists:accounts,account_number'
        ]);

        $account = $request->user()->accounts()->first();
        if ($account->account_number === $request->target_account_number) {
            return back()->withErrors(['target_account_number' => 'Cannot transfer to yourself']);
        }

        if ($account->balance < $request->amount) {
            return back()->withErrors(['amount' => 'Insufficient funds']);
        }

        $targetAccount = Account::where('account_number', $request->target_account_number)->first();

        DB::transaction(function () use ($account, $targetAccount, $request) {
            $account->balance -= $request->amount;
            $account->save();

            $targetAccount->balance += $request->amount;
            $targetAccount->save();

            $account->transactions()->create([
                'type' => 'transfer_out',
                'target_account_id' => $targetAccount->id,
                'amount' => $request->amount,
                'status' => 'completed'
            ]);

            $targetAccount->transactions()->create([
                'type' => 'transfer_in',
                'target_account_id' => $account->id,
                'amount' => $request->amount,
                'status' => 'completed'
            ]);
        });

        return back()->with('success', 'Transfer successful');
    }
}
