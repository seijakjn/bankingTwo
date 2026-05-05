<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            $table->string('purpose')->nullable()->after('branch_id');
            $table->foreignId('address_id')->nullable()->after('purpose')->constrained('addresses')->nullOnDelete();
            $table->string('contact_phone')->nullable()->after('address_id');
            $table->string('contact_email')->nullable()->after('contact_phone');
            $table->string('proof_of_income_path')->nullable()->after('contact_email');
            $table->text('notes')->nullable()->after('proof_of_income_path');
            $table->string('rejection_reason')->nullable()->after('notes');
            $table->timestamp('reviewed_at')->nullable()->after('rejection_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loans', function (Blueprint $table) {
            $table->dropForeign(['address_id']);
            $table->dropColumn([
                'purpose', 'address_id', 'contact_phone', 'contact_email',
                'proof_of_income_path', 'notes', 'rejection_reason', 'reviewed_at'
            ]);
        });
    }
};
