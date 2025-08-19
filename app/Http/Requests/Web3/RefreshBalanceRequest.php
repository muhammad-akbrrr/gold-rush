<?php

namespace App\Http\Requests\Web3;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class RefreshBalanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check rate limiting for balance refresh attempts
        $key = 'refresh-balance:' . $this->ip();
        
        if (RateLimiter::tooManyAttempts($key, 10)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'refresh' => "Too many refresh attempts. Please try again in {$seconds} seconds.",
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
            'force_refresh' => [
                'nullable',
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
            'force_refresh.boolean' => 'Force refresh must be true or false.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'force_refresh' => filter_var($this->force_refresh ?? false, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false,
        ]);
    }
}