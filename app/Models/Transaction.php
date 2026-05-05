<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = ['account_id', 'target_account_id', 'type', 'amount', 'reference', 'status'];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function targetAccount()
    {
        return $this->belongsTo(Account::class, 'target_account_id');
    }
}
