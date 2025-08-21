<?php

namespace App\Http\Middleware;

use App\Services\Web3AuthService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // Get web3 authentication data
        $web3User = null;
        $web3AuthStatus = $this->getWeb3AuthData($request);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() ? $request->user()->only(['id', 'wallet_address', 'display_name', 'token_balance', 'is_authenticated']) : null,
                'web3' => $web3AuthStatus,
            ],
            'web3Config' => [
                'minTokenBalance' => config('web3.min_token_balance', 100000),
                'minTokenBalanceFormatted' => number_format(config('web3.min_token_balance', 100000)),
                'supportedWallets' => ['phantom', 'solflare', 'metamask'],
                'network' => config('web3.network', 'devnet'),
                'messages' => [
                    'insufficientBalance' => config('web3.messages.insufficient_balance'),
                    'authenticationFailed' => config('web3.messages.authentication_failed'),
                    'invalidWallet' => config('web3.messages.invalid_wallet'),
                ],
            ],
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => !$request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
        ];
    }

    /**
     * Get web3 authentication data for sharing with frontend.
     */
    private function getWeb3AuthData(Request $request): array
    {
        try {
            // Try to get web3 user from the service
            $authService = app(Web3AuthService::class);
            $user = $authService->getCurrentUser();

            if ($user) {
                return [
                    'isAuthenticated' => true,
                    'user' => [
                        'id' => $user->id,
                        'walletAddress' => $user->wallet_address,
                        'displayName' => $user->display_name,
                        'tokenBalance' => $user->token_balance,
                        'isAuthenticated' => $user->is_authenticated,
                        'lastBalanceCheck' => $user->last_balance_check?->toISOString(),
                    ],
                    'hasSufficientBalance' => $user->hasSufficientBalance(),
                    'balanceFormatted' => number_format($user->token_balance ?? 0),
                ];
            }

            return [
                'isAuthenticated' => false,
                'user' => null,
                'hasSufficientBalance' => false,
                'balanceFormatted' => null,
            ];
        } catch (\Exception $e) {
            // If there's any issue getting web3 data, return safe defaults
            return [
                'isAuthenticated' => false,
                'user' => null,
                'hasSufficientBalance' => false,
                'balanceFormatted' => null,
            ];
        }
    }
}
