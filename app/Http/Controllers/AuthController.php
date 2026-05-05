<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\JWK;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Exception;

class AuthController extends Controller
{
    public function sync(Request $request)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['error' => 'No token provided'], 401);
        }

        try {
            $jwksUrl = 'https://able-platypus-15.clerk.accounts.dev/.well-known/jwks.json';
            $jwksJson = Cache::remember('clerk_jwks', 3600, function () use ($jwksUrl) {
                return file_get_contents($jwksUrl);
            });
            $jwks = json_decode($jwksJson, true);
            
            $decoded = JWT::decode($token, JWK::parseKeySet($jwks));
            $clerkId = $decoded->sub;

            $user = User::firstOrCreate(
                ['clerk_id' => $clerkId],
                [
                    'name' => 'Banking User', 
                    'email' => $clerkId . '@placeholder.com',
                    'password' => null
                ]
            );

            if ($user->accounts()->count() === 0) {
                $user->accounts()->create([
                    'account_number' => 'ACC' . rand(10000000, 99999999),
                    'balance' => 0.00
                ]);
            }

            Auth::login($user);

            return response()->json(['status' => 'success']);
        } catch (Exception $e) {
            return response()->json(['error' => 'Invalid token', 'message' => $e->getMessage()], 401);
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}
