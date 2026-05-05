<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Interest;

class Account extends Model
{
    protected $fillable = ['user_id', 'account_number', 'balance'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function interests()
    {
        return $this->hasMany(Interest::class);
    }
}
