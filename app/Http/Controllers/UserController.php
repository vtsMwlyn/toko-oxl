<?php

namespace App\Http\Controllers;

use App\Models\ActionLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        return Inertia::render('Admin/User/Index', [
            'users'  => User::orderBy('name')
                ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                    $q->where('name',  'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                }))
                ->paginate(20, ['id', 'name', 'email', 'role']),
            'search' => $search,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'role'     => 'required|in:Admin,User',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'role'     => $request->role,
            'password' => Hash::make($request->password),
        ]);

        ActionLog::create([
            'user_id' => Auth::id(),
            'message' => 'Menambahkan pengguna ' . $user->name . ' (' . $user->email . ') dengan role ' . $user->role,
            'changes' => [
                ['field' => 'name',  'old' => null, 'new' => $user->name],
                ['field' => 'email', 'old' => null, 'new' => $user->email],
                ['field' => 'role',  'old' => null, 'new' => $user->role],
            ],
        ]);

        return back()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role'  => 'required|in:Admin,User',
            // Password is optional on update — only validate if provided
            'password' => $request->filled('password')
                ? ['confirmed', Password::defaults()]
                : 'nullable',
        ]);

        $changes = [];

        if ($user->name !== $request->name) {
            $changes[] = ['field' => 'name', 'old' => $user->name, 'new' => $request->name];
        }
        if ($user->email !== $request->email) {
            $changes[] = ['field' => 'email', 'old' => $user->email, 'new' => $request->email];
        }
        if ($user->role !== $request->role) {
            $changes[] = ['field' => 'role', 'old' => $user->role, 'new' => $request->role];
        }
        if ($request->filled('password')) {
            $changes[] = ['field' => 'password', 'old' => '(hidden)', 'new' => '(updated)'];
        }

        $user->name  = $request->name;
        $user->email = $request->email;
        $user->role  = $request->role;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        if (!empty($changes)) {
            ActionLog::create([
                'user_id' => Auth::id(),
                'message' => 'Memperbarui pengguna ' . $user->name . ' (' . $user->email . ')',
                'changes' => $changes,
            ]);
        }

        return back()->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        ActionLog::create([
            'user_id' => Auth::id(),
            'message' => 'Menghapus pengguna ' . $user->name . ' (' . $user->email . ')',
            'changes' => [
                ['field' => 'name',  'old' => $user->name,  'new' => null],
                ['field' => 'email', 'old' => $user->email, 'new' => null],
                ['field' => 'role',  'old' => $user->role,  'new' => null],
            ],
        ]);

        $user->delete();

        return back()->with('success', 'Pengguna berhasil dihapus.');
    }
}
