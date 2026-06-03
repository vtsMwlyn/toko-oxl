<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barcode_print_configs', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('qty')->default(1);
            $table->decimal('width_cm', 5, 2)->default(4.00);
            $table->decimal('height_cm', 5, 2)->default(1.50);
            $table->decimal('gap_x_mm', 5, 2)->default(4.00);
            $table->decimal('gap_y_mm', 5, 2)->default(4.00);
            $table->decimal('margin_top_mm', 5, 2)->default(8.00);
            $table->decimal('margin_right_mm', 5, 2)->default(8.00);
            $table->decimal('margin_bottom_mm', 5, 2)->default(8.00);
            $table->decimal('margin_left_mm', 5, 2)->default(8.00);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barcode_print_configs');
    }
};
