<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\Loan;
use App\Models\Interest;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $allUsers = User::with('accounts')->where('id', '!=', $request->user()->id)->get();
        $users = $allUsers->where('role', 'user');
        $branches = $allUsers->where('role', 'branch');
        $admins = $allUsers->where('role', 'admin');

        // Metrics
        $totalUserDeposits = Account::whereHas('user', function($q) {
            $q->where('role', 'user');
        })->sum('balance');

        $totalBranchReserves = Account::whereHas('user', function($q) {
            $q->where('role', 'branch');
        })->sum('balance');

        $totalTransactionsCount = Transaction::count();
        $totalLoansAmount = Loan::whereIn('status', ['approved', 'paid'])->sum('amount');
        $totalPendingLoansCount = Loan::where('status', 'pending')->count();
        $totalInterestAccrued = Interest::sum('amount');

        return Inertia::render('Admin/Dashboard', [
            'users' => $users->values(),
            'branches' => $branches->values(),
            'admins' => $admins->values(),
            'stats' => [
                'totalUserDeposits' => (float)$totalUserDeposits,
                'totalBranchReserves' => (float)$totalBranchReserves,
                'totalTransactionsCount' => $totalTransactionsCount,
                'totalLoansAmount' => (float)$totalLoansAmount,
                'totalPendingLoansCount' => $totalPendingLoansCount,
                'totalInterestAccrued' => (float)$totalInterestAccrued,
            ],
            'queryResult' => session('queryResult'),
            'queryError' => session('queryError'),
            'lastQuery' => session('lastQuery')
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'role' => 'required|in:user,branch,admin'
        ]);

        $user->role = $request->role;
        $user->save();

        return back()->with('success', "Role updated for {$user->name} to {$request->role}.");
    }

    public function fundBranch(Request $request, User $user)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'amount' => 'required|numeric|min:1'
        ]);

        $account = $user->accounts()->first();
        if (!$account) {
            // Create a default branch account if missing
            $account = $user->accounts()->create([
                'account_number' => 'VAULT-BRANCH-' . $user->id,
                'type' => 'savings',
                'balance' => 0,
                'status' => 'active'
            ]);
        }

        $account->balance += $request->amount;
        $account->save();

        return back()->with('success', "Funded $" . number_format($request->amount, 2) . " to branch {$user->name}.");
    }

    public function executeQuery(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'query' => 'required|string'
        ]);

        $query = $request->input('query');

        try {
            // Very dangerous for production, but user explicitly asked for it for testing.
            $result = DB::select($query);
            
            // Convert to array if it's objects
            $resultArray = array_map(function($item) {
                return (array)$item;
            }, $result);

            return back()->with([
                'queryResult' => $resultArray,
                'lastQuery' => $query
            ]);
        } catch (\Exception $e) {
            return back()->with([
                'queryError' => $e->getMessage(),
                'lastQuery' => $query
            ]);
        }
    }

    public function toggleFreeze(Request $request, User $user)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        if ($user->role === 'admin') {
            return back()->withErrors(['error' => 'Cannot freeze another admin.']);
        }

        $user->is_frozen = !$user->is_frozen;
        $user->save();

        $status = $user->is_frozen ? 'frozen' : 'unfrozen';
        return back()->with('success', "User account has been {$status}.");
    }

    public function updateRecord(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'table' => 'required|string',
            'id' => 'required',
            'id_column' => 'required|string',
            'data' => 'required|array'
        ]);

        try {
            DB::table($request->table)
                ->where($request->id_column, $request->id)
                ->update($request->data);

            return back()->with('success', 'Record updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Update failed: ' . $e->getMessage()]);
        }
    }
}
