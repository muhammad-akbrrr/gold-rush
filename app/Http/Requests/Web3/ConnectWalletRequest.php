<?php

namespace App\Http\Requests\Web3;

use App\Services\WalletValidationService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class ConnectWalletRequest extends FormRequest
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
        // Check rate limiting for wallet connection attempts
        $key = 'connect-wallet:' . $this->ip();
        
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'wallet_address' => "Too many connection attempts. Please try again in {$seconds} seconds.",
            ]);
        }

        RateLimiter::hit($key, 300); // 5 minutes decay

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
                        Log::warning('Invalid wallet address in connection request', [
                            'wallet_address' => $value,
                            'ip' => $this->ip(),
                            'user_agent' => $this->userAgent(),
                            'errors' => $validation['errors']
                        ]);
                        
                        $fail('The wallet address format is invalid.');
                    }
                },
            ],
            'signature' => [
                'required',
                'string',
                'min:64',
                'max:128', // Base58 encoded signatures can vary in length
            ],
            'message' => [
                'required',
                'string',
                'min:10',
                'max:500',
            ],
            'display_name' => [
                'nullable',
                'string',
                'max:100',
                'regex:/^[a-zA-Z0-9\s\-_.]+$/', // Allow alphanumeric, spaces, hyphens, underscores, periods
            ],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'wallet_address.required' => 'Wallet address is required for connection.',
            'wallet_address.size' => 'Wallet address must be exactly 44 characters.',
            'signature.required' => 'Signature is required to verify wallet ownership.',
            'signature.min' => 'Signature must be at least 64 characters.',
            'signature.max' => 'Signature must not exceed 128 characters.',
            'message.required' => 'Message is required for signature verification.',
            'message.min' => 'Message must be at least 10 characters.',
            'message.max' => 'Message must not exceed 500 characters.',
            'display_name.max' => 'Display name must not exceed 100 characters.',
            'display_name.regex' => 'Display name can only contain letters, numbers, spaces, hyphens, underscores, and periods.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'wallet_address' => trim($this->wallet_address ?? ''),
            'signature' => trim($this->signature ?? ''),
            'message' => trim($this->message ?? ''),
            'display_name' => $this->display_name ? trim($this->display_name) : null,
        ]);
    }

    /**
     * Get the validated data from the request.
     */
    public function validated($key = null, $default = null): array
    {
        $validated = parent::validated();

        // Log successful validation for security monitoring
        Log::info('Wallet connection request validated', [
            'wallet_address' => $validated['wallet_address'],
            'has_display_name' => !empty($validated['display_name']),
            'ip' => $this->ip(),
            'user_agent' => $this->userAgent(),
        ]);

        return $validated;
    }
}