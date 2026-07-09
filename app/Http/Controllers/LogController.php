<?php

namespace App\Http\Controllers;

use App\Models\ActionLog;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index(\Illuminate\Http\Request $request){
        $query = ActionLog::with('user');

        if ($request->date_start) {
            $query->whereDate('created_at', '>=', $request->date_start);
        }
        
        if ($request->date_end) {
            $query->whereDate('created_at', '<=', $request->date_end);
        }

        return Inertia::render('Admin/Log/Index', [
            'logs' => $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString(),
            'filters' => [
                'date_start' => $request->date_start,
                'date_end' => $request->date_end,
            ],
        ]);
    }
}
