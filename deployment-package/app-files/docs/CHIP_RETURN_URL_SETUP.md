# CHIP Payment Return URL Configuration

## Overview

The CHIP payment gateway now includes proper return URL configuration to redirect users back to your application after completing payment.

## How It Works

### Payment Flow

1. **User initiates payment** → Redirected to CHIP checkout page
2. **User completes payment on CHIP** 
3. **CHIP processes payment**
4. **Two things happen simultaneously:**
   - **Server callback** (`success_callback`/`failure_callback`) → Webhook to verify payment server-side
   - **User redirect** (`success_redirect`/`failure_redirect`) → User is redirected back to your app

### URL Types

CHIP supports two types of URLs:

#### 1. Callback URLs (Server-to-Server)
These are webhooks for server-side payment verification:
- `success_callback`: `/checkout/callback/chip`
- `failure_callback`: `/checkout/callback/chip`
- `cancel_callback`: `/checkout`

**Purpose**: Verify payment status and update database

#### 2. Redirect URLs (User-Facing)
These are where users land after payment:
- `success_redirect`: `/subscription/payment/success`
- `failure_redirect`: `/subscription/payment/failed`

**Purpose**: Show success/error messages to users and redirect to appropriate pages

## Implementation

### ChipGateway.php
Added redirect URL parameters to the payment creation:

```php
$payloadData = [
    'brand_id' => $this->brandId,
    // ... other fields ...
    'success_callback' => $successCallback,  // Server webhook
    'failure_callback' => $failureCallback,  // Server webhook
    'cancel_callback' => $cancelCallback,     // Server webhook
    'success_redirect' => $successRedirect,   // User redirect ✓ NEW
    'failure_redirect' => $failureRedirect,   // User redirect ✓ NEW
];
```

### Routes (web.php)
Added new routes for payment redirects:

```php
Route::get('/subscription/payment/success', [PaymentRedirectController::class, 'success'])
    ->name('subscription.payment.success');
Route::get('/subscription/payment/failed', [PaymentRedirectController::class, 'failed'])
    ->name('subscription.payment.failed');
```

### PaymentRedirectController.php
New controller to handle user-facing redirects:

- `success()` → Redirects to dashboard with success message
- `failed()` → Redirects to checkout with error message

Both methods log the payment redirect for debugging and audit purposes.

## User Experience

### Successful Payment
1. User pays on CHIP ✓
2. CHIP redirects to: `https://yourdomain.com/subscription/payment/success`
3. User sees: "Payment successful! Your subscription is now active."
4. User is redirected to dashboard

### Failed/Cancelled Payment
1. User cancels or payment fails ❌
2. CHIP redirects to: `https://yourdomain.com/subscription/payment/failed`
3. User sees: "Payment failed or was cancelled. Please try again..."
4. User is redirected to checkout page

## Important Notes

### Dual Verification
- **Redirect URLs** provide immediate user feedback
- **Callback URLs** ensure server-side payment verification
- Always trust callback verification over redirect URLs for security

### Local Development
- Both redirect and callback URLs work in local development
- Redirect URLs will work with localhost
- Callback URLs require public URLs (use ngrok for testing)

### Security
- Payment status is verified via callback webhooks
- Redirect URLs are for UX only
- Never rely solely on redirect URLs for payment confirmation

## Testing

### Test the flow:
1. Make a test payment
2. Complete payment on CHIP
3. Verify you're redirected to success page
4. Check dashboard shows success message
5. Verify subscription is activated (via callback)

### Check logs:
```bash
tail -f storage/logs/laravel.log | grep "Payment redirect"
```

You should see:
```
Payment redirect - Success
purchase_id: xxx-xxx-xxx
user_id: 123
```

## Deployment Checklist

- ✅ Routes added to web.php
- ✅ PaymentRedirectController created
- ✅ ChipGateway updated with redirect URLs
- ✅ Deployment package files synced
- ✅ Both success and failure flows implemented

## Related Files

- [`app/Services/Payment/ChipGateway.php`](../app/Services/Payment/ChipGateway.php)
- [`app/Http/Controllers/Subscription/PaymentRedirectController.php`](../app/Http/Controllers/Subscription/PaymentRedirectController.php)
- [`routes/web.php`](../routes/web.php)
- [`docs/CHIP_PAYMENT_GATEWAY.md`](CHIP_PAYMENT_GATEWAY.md)
