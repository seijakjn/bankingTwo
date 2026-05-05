<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "Production User Emails:\n";
foreach (User::all() as $u) {
    echo "ID: {$u->id} | Email: {$u->email} | Role: {$u->role}\n";
}
