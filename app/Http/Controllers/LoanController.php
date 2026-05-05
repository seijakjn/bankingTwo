<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Loan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        return Inertia::render('Loans', [
            'loans' => $user->loans()->with('address')->latest()->get(),
            'addresses' => $user->addresses,
            'userContact' => [
                'phone' => $user->phone,
                'email' => $user->email,
                'secondary_email' => $user->secondary_email,
            ],
            'branches' => \App\Models\User::where('role', 'branch')->get(['id', 'name'])
        ]);
    }

    public function apply(Request $request)
    {
        if ($request->user()->is_frozen) {
            return back()->withErrors(['error' => 'Your account is frozen.']);
        }

        $request->validate([
            'purpose'       => 'required|string|in:Personal,Home Improvement,Auto,Education,Business,Medical,Debt Consolidation',
            'amount'        => 'required|numeric|min:100|max:1000000',
            'term_months'   => 'required|integer|in:12,24,36,48,60',
            'address_id'    => 'nullable|exists:addresses,id',
            'contact_phone' => 'required|string|max:20',
            'contact_email' => 'required|email',
            'proof_of_income' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'notes'         => 'nullable|string|max:1000',
            'branch_id'     => 'required|exists:users,id',
        ]);

        $user->loans()->create([
            'branch_id'          => $request->branch_id,
            'purpose'            => $request->purpose,
            'address_id'         => $request->address_id,
            'contact_phone'      => $request->contact_phone,
            'contact_email'      => $request->contact_email,
            'proof_of_income_path' => $path,
            'notes'              => $request->notes,
            'amount'             => $request->amount,
            'term_months'        => $request->term_months,
            'status'             => 'pending',
        ]);

        return back()->with('success', 'Loan application submitted successfully. We will review it shortly.');
    }

    public function payOff(Request $request, $id)
    {
        $user = $request->user();
        $loan = Loan::where('id', $id)->where('user_id', $user->id)->where('status', 'approved')->firstOrFail();

        $userAccount = $user->accounts()->first();
        if (!$userAccount) {
            return back()->withErrors(['error' => 'No account found.']);
        }

        if ($userAccount->balance < $loan->amount) {
            return back()->with('error', 'Insufficient balance to pay off this loan.');
        }

        // Find branch reserve
        $branchUser = \App\Models\User::find($loan->branch_id);
        $branchAccount = $branchUser ? $branchUser->accounts()->first() : null;

        \Illuminate\Support\Facades\DB::transaction(function () use ($loan, $userAccount, $branchAccount) {
            // Deduct from user
            $userAccount->balance -= $loan->amount;
            $userAccount->save();

            // Credit branch reserve
            if ($branchAccount) {
                $branchAccount->balance += $loan->amount;
                $branchAccount->save();

                $branchAccount->transactions()->create([
                    'type' => 'transfer_in',
                    'target_account_id' => $userAccount->id,
                    'amount' => $loan->amount,
                    'status' => 'completed',
                    'reference' => 'Loan Repayment #' . $loan->id,
                ]);
            }

            $userAccount->transactions()->create([
                'type' => 'transfer_out',
                'target_account_id' => $branchAccount?->id,
                'amount' => $loan->amount,
                'status' => 'completed',
                'reference' => 'Loan Repayment #' . $loan->id,
            ]);

            $loan->status = 'paid';
            $loan->save();
        });

        return back()->with('success', 'Loan paid off successfully! Your account has been updated.');
    }
}
