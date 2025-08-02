<?php

namespace App\Http\Requests\Web3;

use App\Services\WalletValidationService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class VerifyBalanceRequest extends FormRequest
{
    protected WalletValidationService $walletValidator;

    public function __construct(WalletValidationService $walletValidator)
    {
        parent::__construct();
        $this->walletValidator = $walletValidator;
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check rate limiting for balance verification attempts
        $key = 'verify-balance:' . $this->ip();
        
        if (RateLimiter::tooManyAttempts($key, 10)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'wallet_address' => "Too many balance verification attempts. Please try again in {$seconds} seconds.",
            ]);
        }

        RateLimiter::hit($key, 60); // 1 minute decay

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'wallet_address' => [
                'required',
                'string',
                'size:44', // Solana addresses are typically 44 characters
                function ($attribute, $value, $fail) {
                    $validation = $this->walletValidator->validate($value);
                    
                    if (!$validation['valid']) {
                        Log::warning('Invalid wallet address in balance verification', [
                            'wallet_address' => $value,
                            'ip' => $this->ip(),
                            'user_agent' => $this->userAgent(),
                            'errors' => $validation['errors']
                        ]);
                        
                        $fail('The wallet address format is invalid.');
                    }
                },
            ],
            'force_refresh' => [
                'sometimes',
                'boolean',
            ],
            'include_metadata' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'wallet_address.required' => 'Wallet address is required for balance verification.',
            'wallet_address.size' => 'Wallet address must be exactly 44 characters.',
            'force_refresh.boolean' => 'Force refresh must be true or false.',
            'include_metadata.boolean' => 'Include metadata must be true or false.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'wallet_address' => trim($this->wallet_address ?? ''),
            'force_refresh' => $this->boolean('force_refresh', false),
            'include_metadata' => $this->boolean('include_metadata', false),
        ]);
    }

    /**
     * Get the validated data from the request.
     */
    public function validated($key = null, $default = null): array
    {
        $validated = parent::validated();

        // Log balance verification request for monitoring
        Log::info('Balance verification request validated', [
            'wallet_address' => $validated['wallet_address'],
            'force_refresh' => $validated['force_refresh'] ?? false,
            'include_metadata' => $validated['include_metadata'] ?? false,
            'ip' => $this->ip(),
            'user_agent' => $this->userAgent(),
        ]);

        return $validated;
    }

    /**
     * Get additional context data for the request
     */
    public function getRequestContext(): array
    {
        return [
            'ip_address' => $this->ip(),
            'user_agent' => $this->userAgent(),
            'timestamp' => now(),
            'request_id' => $this->header('X-Request-ID') ?? uniqid(),
        ];
    }
}