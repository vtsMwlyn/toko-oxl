<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->unsignedBigInteger('variant_id');
            $table->foreign('variant_id')->references('id')->on('variants')->onDelete('cascade');
            $table->unsignedInteger('qty');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('returns');
    }
};
