<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Loans', [
            'loans' => $request->user()->loans
        ]);
    }

    public function apply(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100|max:100000',
            'term_months' => 'required|integer|in:12,24,36,48,60'
        ]);

        $user = $request->user();

        $user->loans()->create([
            'amount' => $request->amount,
            'term_months' => $request->term_months,
            'status' => 'pending'
        ]);

        return back()->with('success', 'Loan application submitted successfully.');
    }
}
