<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Interest extends Model
{
    use HasFactory;

    protected $primaryKey = 'accrual_id';

    protected $fillable = [
        'account_id',
        'accrual_date',
        'amount',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}
