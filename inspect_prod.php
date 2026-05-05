<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Loan;

echo "Production Users:\n";
foreach (User::all() as $u) {
    echo "ID: {$u->id} | Name: {$u->name} | Role: {$u->role}\n";
}

echo "\nAll loans in production:\n";
foreach (Loan::all() as $l) {
    echo "ID: {$l->id} | User: {$l->user_id} | Branch: {$l->branch_id} | Purpose: {$l->purpose} | Status: {$l->status}\n";
}
