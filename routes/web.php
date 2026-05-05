<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\LoanController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Landing');
})->name('landing');

Route::post('/auth/sync', [AuthController::class, 'sync'])->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
Route::post('/auth/logout', [AuthController::class, 'logout']);

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions');
    Route::post('/transactions/deposit', [TransactionController::class, 'deposit']);
    Route::post('/transactions/withdraw', [TransactionController::class, 'withdraw']);
    Route::post('/transactions/transfer', [TransactionController::class, 'transfer']);
    
    Route::get('/cards', [CardController::class, 'index'])->name('cards');
    Route::post('/cards/apply', [CardController::class, 'apply']);
    Route::post('/cards/freeze', [CardController::class, 'freeze']);
    Route::post('/cards/cancel', [CardController::class, 'cancel']);
    
    Route::get('/loans', [LoanController::class, 'index'])->name('loans');
    Route::post('/loans/apply', [LoanController::class, 'apply']);
});
