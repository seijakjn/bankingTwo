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
        $account = $request->user()->accounts()->first();
        $transactions = $account ? $account->transactions()->latest()->get() : [];
        return Inertia::render('Transactions', [
            'account' => $account,
            'transactions' => $transactions
        ]);
    }

    public function deposit(Request $request)
    {
        $request->validate(['amount' => 'required|numeric|min:1']);
        $account = $request->user()->accounts()->first();

        DB::transaction(function () use ($account, $request) {
            $account->balance += $request->amount;
            $account->save();

            $account->transactions()->create([
                'type' => 'deposit',
                'amount' => $request->amount,
                'status' => 'completed'
            ]);
        });

        return back()->with('success', 'Deposit successful');
    }

    public function withdraw(Request $request)
    {
        $request->validate(['amount' => 'required|numeric|min:1']);
        $account = $request->user()->accounts()->first();

        if ($account->balance < $request->amount) {
            return back()->withErrors(['amount' => 'Insufficient funds']);
        }

        DB::transaction(function () use ($account, $request) {
            $account->balance -= $request->amount;
            $account->save();

            $account->transactions()->create([
                'type' => 'withdraw',
                'amount' => $request->amount,
                'status' => 'completed'
            ]);
        });

        return back()->with('success', 'Withdrawal successful');
    }

    public function transfer(Request $request)
    {
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
