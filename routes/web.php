<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\LoanController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AdminController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\AddressController;

Route::get('/', function () {
    return inertia('Landing');
})->name('landing');

Route::post('/auth/sync', [AuthController::class, 'sync'])->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
Route::post('/auth/logout', [AuthController::class, 'logout']);

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    Route::middleware('frozen')->group(function () {
        Route::post('/transactions/deposit', [TransactionController::class, 'deposit']);
        Route::post('/transactions/withdraw', [TransactionController::class, 'withdraw']);
        Route::post('/transactions/transfer', [TransactionController::class, 'transfer']);
        
        Route::post('/cards/apply', [CardController::class, 'apply']);
        Route::post('/cards/cancel', [CardController::class, 'cancel']);
        
        Route::post('/loans/apply', [LoanController::class, 'apply']);
        Route::post('/loans/{id}/payoff', [LoanController::class, 'payOff']);

        Route::put('/profile/contact', [AddressController::class, 'updateContact']);
        Route::put('/profile/name', [AddressController::class, 'updateName']);
        Route::post('/profile/addresses', [AddressController::class, 'store']);
        Route::delete('/profile/addresses/{id}', [AddressController::class, 'destroy']);
    });

    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions');
    Route::get('/cards', [CardController::class, 'index'])->name('cards');
    Route::get('/loans', [LoanController::class, 'index'])->name('loans');

    // Addresses
    Route::get('/profile/addresses', [AddressController::class, 'index'])->name('addresses.index');

    // Admin
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::post('/admin/users/{user}/freeze', [AdminController::class, 'toggleFreeze']);
    Route::post('/admin/query', [AdminController::class, 'executeQuery']);
    Route::post('/admin/update-record', [AdminController::class, 'updateRecord']);

    // Branch
    Route::get('/branch/dashboard', [BranchController::class, 'dashboard'])->name('branch.dashboard');
    Route::get('/branch/loans/{loan}', [BranchController::class, 'viewApplication'])->name('branch.loan.view');
    Route::post('/branch/loans/{loan}/approve', [BranchController::class, 'approveLoan']);
    Route::post('/branch/loans/{loan}/reject', [BranchController::class, 'rejectLoan']);
});
