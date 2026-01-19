<?php

namespace App\Services\Payment;

use App\Models\PaymentGateway;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;

interface PaymentGatewayInterface
{
    /**
     * construct the gateway with configuration
     */
    public function __construct(PaymentGateway $gatewayModel);

    /**
     * Initiate a payment request
     * Returns the payment URL or array with redirect_url
     */
    public function createPayment(User $user, float $amount, string $currency, array $metadata = []): array;

    /**
     * Handle callback/webhook from the gateway
     */
    public function handleCallback(Request $request): Transaction;
}
