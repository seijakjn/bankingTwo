<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserFrozen
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->is_frozen) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Your account is currently frozen by administration.'], 403);
            }
            return back()->withErrors(['error' => 'Your account is currently frozen by administration. Destructive actions are disabled.']);
        }

        return $next($request);
    }
}
