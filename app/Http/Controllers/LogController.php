<?php

namespace App\Http\Controllers;

use App\Models\ActionLog;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index(){
        return Inertia::render('Admin/Log/Index', [
            'logs' => ActionLog::orderBy('created_at', 'desc')->with('user')->paginate(20),
        ]);
    }
}
