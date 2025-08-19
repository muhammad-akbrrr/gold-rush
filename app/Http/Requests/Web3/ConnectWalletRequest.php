<?php

namespace App\Http\Requests\Web3;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class ConnectWalletRequest extends FormRequest
{
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
                'regex:/^[1-9A-HJ-NP-Za-km-z]{32,44}$/',
            ],
            'signature' => [
                'nullable',
                'string',
                'min:64',
                'max:128',
            ],
            'message' => [
                'nullable',
                'string',
                'required_with:signature',
                'min:10',
                'max:500',
            ],
            'wallet_type' => [
                'nullable',
                'string',
                'in:phantom,solflare,metamask',
            ],
            'display_name' => [
                'nullable',
                'string',
                'max:100',
                'regex:/^[a-zA-Z0-9\s\-_.]+$/',
            ],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'wallet_address.required' => 'Wallet address is required.',
            'wallet_address.regex' => 'Invalid wallet address format.',
            'signature.min' => 'Signature must be at least 64 characters.',
            'signature.max' => 'Signature must not exceed 128 characters.',
            'message.required_with' => 'Message is required when signature is provided.',
            'message.min' => 'Message must be at least 10 characters.',
            'message.max' => 'Message must not exceed 500 characters.',
            'wallet_type.in' => 'Wallet type must be phantom, solflare, or metamask.',
            'display_name.max' => 'Display name must not exceed 100 characters.',
            'display_name.regex' => 'Display name can only contain letters, numbers, spaces, hyphens, underscores, and periods.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'wallet_address' => 'wallet address',
            'wallet_type' => 'wallet type',
            'display_name' => 'display name',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'wallet_address' => trim($this->wallet_address ?? ''),
            'signature' => $this->signature ? trim($this->signature) : null,
            'message' => $this->message ? trim($this->message) : null,
            'wallet_type' => $this->wallet_type ? trim($this->wallet_type) : null,
            'display_name' => $this->display_name ? trim($this->display_name) : null,
        ]);
    }
}