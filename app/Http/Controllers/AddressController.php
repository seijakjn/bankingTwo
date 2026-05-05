<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Profile/Address', [
            'addresses' => $request->user()->addresses,
            'user' => $request->user()->only('first_name', 'last_name', 'phone', 'secondary_email'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'postal_code' => 'required|string',
            'country' => 'required|string',
        ]);

        $request->user()->addresses()->create($request->only('type', 'city', 'state', 'postal_code', 'country'));

        return back()->with('success', 'Address added successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->delete();

        return back()->with('success', 'Address deleted successfully.');
    }

    public function updateContact(Request $request)
    {
        $request->validate([
            'phone'           => 'nullable|string|max:20',
            'secondary_email' => 'nullable|email|max:255',
        ]);

        $request->user()->update([
            'phone'           => $request->phone,
            'secondary_email' => $request->secondary_email,
        ]);

        return back()->with('success', 'Contact information updated.');
    }

    public function updateName(Request $request)
    {
        $request->validate([
            'first_name' => 'nullable|string|max:50',
            'last_name'  => 'nullable|string|max:50',
        ]);

        $request->user()->update([
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
        ]);

        return back()->with('success', 'Name updated successfully.');
    }
}
