<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    protected $fillable = [
        'user_id', 'branch_id', 'purpose', 'address_id',
        'contact_phone', 'contact_email',
        'proof_of_income_path', 'notes',
        'amount', 'term_months', 'status',
        'rejection_reason', 'reviewed_at'
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function branch()
    {
        return $this->belongsTo(User::class, 'branch_id');
    }

    public function address()
    {
        return $this->belongsTo(\App\Models\Address::class);
    }
}
