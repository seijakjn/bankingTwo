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

        $users = User::with('accounts')->where('role', 'user')->get();
        $branches = User::with('accounts')->where('role', 'branch')->get();

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
            'users' => $users,
            'branches' => $branches,
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
