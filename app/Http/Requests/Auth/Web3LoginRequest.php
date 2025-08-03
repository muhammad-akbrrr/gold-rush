<?php

namespace App\Http\Requests\Auth;

use App\Services\WalletValidationService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class Web3LoginRequest extends FormRequest
{
  protected WalletValidationService $validationService;

  public function __construct(WalletValidationService $validationService)
  {
    $this->validationService = $validationService;
  }

  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    return true;
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    return [
      'wallet_address' => [
        'required',
        'string',
        'max:44',
        function ($attribute, $value, $fail) {
          if (!$this->validationService->validateSolanaAddress($value)) {
            $fail(config('web3.messages.invalid_wallet'));
          }
        },
      ],
      'signature' => [
        'nullable',
        'string',
        'required_with:message',
      ],
      'message' => [
        'nullable',
        'string',
        'required_with:signature',
      ],
      'display_name' => [
        'nullable',
        'string',
        'max:255',
      ],
    ];
  }

  /**
   * Get custom messages for validator errors.
   */
  public function messages(): array
  {
    return [
      'wallet_address.required' => 'Wallet address is required.',
      'wallet_address.string' => 'Wallet address must be a string.',
      'wallet_address.max' => 'Wallet address cannot exceed 44 characters.',
      'signature.required_with' => 'Signature is required when message is provided.',
      'message.required_with' => 'Message is required when signature is provided.',
      'display_name.max' => 'Display name cannot exceed 255 characters.',
    ];
  }

  /**
   * Get custom attributes for validator errors.
   */
  public function attributes(): array
  {
    return [
      'wallet_address' => 'wallet address',
      'signature' => 'signature',
      'message' => 'message',
      'display_name' => 'display name',
    ];
  }

  /**
   * Prepare the data for validation.
   */
  protected function prepareForValidation(): void
  {
    // Sanitize wallet address
    if ($this->has('wallet_address')) {
      $this->merge([
        'wallet_address' => $this->validationService->sanitizeAddress($this->wallet_address),
      ]);
    }

    // Trim display name
    if ($this->has('display_name')) {
      $this->merge([
        'display_name' => trim($this->display_name),
      ]);
    }
  }

  /**
   * Handle a failed validation attempt.
   */
  protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator): void
  {
    // Log validation attempt for security monitoring
    $this->validationService->logValidationAttempt(
      $this->wallet_address ?? '',
      false,
      $validator->errors()->all()
    );

    parent::failedValidation($validator);
  }
}