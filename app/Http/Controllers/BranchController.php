<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Loan;
use Illuminate\Support\Facades\DB;

class BranchController extends Controller
{
    public function dashboard(Request $request)
    {
        if ($request->user()->role !== 'branch') {
            abort(403, 'Unauthorized');
        }

        $branchId = $request->user()->id;

        $pendingLoans = Loan::with(['user', 'address'])
            ->where('branch_id', $branchId)
            ->where('status', 'pending')
            ->latest()->get();

        $recentLoans = Loan::with(['user'])
            ->where('branch_id', $branchId)
            ->whereIn('status', ['approved', 'rejected'])
            ->latest('reviewed_at')->take(10)->get();

        $branchAccount = $request->user()->accounts()->first();

        return Inertia::render('Branch/Dashboard', [
            'pendingLoans'  => $pendingLoans,
            'recentLoans'   => $recentLoans,
            'branchBalance' => $branchAccount ? (float) $branchAccount->balance : 0,
        ]);
    }

    public function viewApplication(Request $request, Loan $loan)
    {
        if ($request->user()->role !== 'branch' || $loan->branch_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $loan->load(['user', 'address']);

        return Inertia::render('Branch/ViewApplication', [
            'loan' => $loan,
        ]);
    }

    public function approveLoan(Request $request, Loan $loan)
    {
        if ($request->user()->role !== 'branch' || $loan->branch_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        if ($loan->status !== 'pending') {
            return back()->withErrors(['error' => 'Loan is already processed.']);
        }

        $branchAccount = $request->user()->accounts()->first();
        $userAccount = $loan->user->accounts()->first();

        if (!$branchAccount || $branchAccount->balance < $loan->amount) {
            return back()->withErrors(['error' => 'Branch has insufficient funds to approve this loan.']);
        }

        if (!$userAccount) {
            return back()->withErrors(['error' => 'Applicant does not have a bank account.']);
        }

        DB::transaction(function () use ($loan, $branchAccount, $userAccount) {
            $loan->status = 'approved';
            $loan->reviewed_at = now();
            $loan->save();

            $branchAccount->balance -= $loan->amount;
            $branchAccount->save();

            $userAccount->balance += $loan->amount;
            $userAccount->save();

            $branchAccount->transactions()->create([
                'type' => 'transfer_out',
                'target_account_id' => $userAccount->id,
                'amount' => $loan->amount,
                'status' => 'completed',
                'reference' => 'Loan Disbursement #' . $loan->id
            ]);

            $userAccount->transactions()->create([
                'type' => 'transfer_in',
                'target_account_id' => $branchAccount->id,
                'amount' => $loan->amount,
                'status' => 'completed',
                'reference' => 'Loan Disbursement #' . $loan->id
            ]);
        });

        return redirect()->route('branch.dashboard')->with('success', 'Loan approved and $' . number_format($loan->amount, 2) . ' disbursed to applicant.');
    }

    public function rejectLoan(Request $request, Loan $loan)
    {
        if ($request->user()->role !== 'branch' || $loan->branch_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        if ($loan->status !== 'pending') {
            return back()->withErrors(['error' => 'Loan is already processed.']);
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $loan->status = 'rejected';
        $loan->rejection_reason = $request->rejection_reason;
        $loan->reviewed_at = now();
        $loan->save();

        return redirect()->route('branch.dashboard')->with('success', 'Loan application rejected.');
    }
}
