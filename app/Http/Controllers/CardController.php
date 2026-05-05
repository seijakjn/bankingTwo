<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CardController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Cards', [
            'card' => $request->user()->cards()->whereIn('status', ['active', 'frozen'])->first()
        ]);
    }

    public function apply(Request $request)
    {
        $request->validate(['type' => 'required|in:Debit,Credit']);
        $user = $request->user();

        // Check if there is an active or frozen card. If cancelled, they can apply for a new one.
        $existingCard = $user->cards()->whereIn('status', ['active', 'frozen'])->first();
        if ($existingCard) {
            return back()->withErrors(['error' => 'You already have an active or frozen card.']);
        }

        $user->cards()->create([
            'card_number' => ($request->type === 'Credit' ? '5000 ' : '4000 ') . rand(1000, 9999) . ' ' . rand(1000, 9999) . ' ' . rand(1000, 9999),
            'expiry' => now()->addYears(3)->format('m/y'),
            'cvv' => rand(100, 999),
            'status' => 'active',
            'type' => $request->type
        ]);

        return back()->with('success', $request->type . ' Card issued successfully.');
    }

    public function freeze(Request $request)
    {
        $card = $request->user()->cards()->whereIn('status', ['active', 'frozen'])->first();
        if ($card) {
            $card->status = $card->status === 'frozen' ? 'active' : 'frozen';
            $card->save();
            return back()->with('success', 'Card status changed to ' . $card->status);
        }
        return back()->withErrors(['error' => 'No active card found.']);
    }

    public function cancel(Request $request)
    {
        $card = $request->user()->cards()->whereIn('status', ['active', 'frozen'])->first();
        if ($card) {
            $card->status = 'cancelled';
            $card->save();
            return back()->with('success', 'Card cancelled successfully.');
        }
        return back()->withErrors(['error' => 'No active card found.']);
    }
}
