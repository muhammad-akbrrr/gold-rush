<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = Auth::guard('web3')->user();
        
        return Inertia::render('settings/profile', [
            'user' => $user ? $user->only(['id', 'wallet_address', 'display_name', 'token_balance', 'is_authenticated']) : null,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = Auth::guard('web3')->user();
        
        // For Web3 users, we can only update display_name
        $request->validate([
            'display_name' => ['nullable', 'string', 'max:255'],
        ]);

        if ($user) {
            $user->update($request->only(['display_name']));
        }

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // For Web3 users, no password validation needed
        // In a real implementation, you might require wallet signature confirmation
        
        $user = Auth::guard('web3')->user();

        if (!$user) {
            abort(401, 'User not authenticated');
        }

        // Logout FIRST while user still exists, then delete
        Auth::guard('web3')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        // Now delete the user
        $user->delete();
        
        return redirect('/');
    }
}
