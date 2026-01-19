# CHIP Payment Gateway Configuration Guide

## Official Documentation
- GitHub SDK: https://github.com/CHIPAsia/chip-php-sdk
- API Documentation: https://developer.chip-in.asia/api
- Merchant Portal: https://gate.chip-in.asia/login

## Required Configuration Fields

### 1. Brand ID (Required)
- **Field Name**: `brand_id`
- **Description**: Your unique CHIP Brand ID
- **How to get**: Login to CHIP Merchant Portal → Developer Dashboard → Create Brand ID
- **Example**: `a5a88724-ed15-4410-a068-cb77da197e08`
- **Usage**: Used for all API calls to identify your brand

### 2. API Key (Required)
- **Field Name**: `api_key`
- **Description**: Your CHIP API authentication key
- **How to get**: Login to CHIP Merchant Portal → Developer Dashboard → Generate API Key
- **Security**: Should be encrypted in database
- **Usage**: Used as Bearer token for API authentication

### 3. Webhook Secret (Optional - Only for Webhooks)
- **Field Name**: `webhook_secret`
- **Description**: Public key for verifying webhook signatures
- **How to get**: Generated when you register your webhook URL in CHIP dashboard
- **Usage**: Used to verify X-Signature header in webhook callbacks
- **Note**: Only needed if you're using webhooks instead of redirect callbacks

### 4. Webhook URL (Optional - Only for Webhooks)
- **Field Name**: Not stored in gateway config (informational only)
- **Description**: The URL where CHIP sends payment notifications
- **Format**: `https://your-domain.com/payment/chip/webhook`
- **Setup**: Configure this URL in CHIP Merchant Portal
- **Note**: This is configured in CHIP's dashboard, not in our system

## Environment (Sandbox vs Production)

CHIP doesn't have separate API endpoints for sandbox and production. The environment is determined by:
- The **Brand ID** you use (test brand vs live brand)
- The **API Key** you use (test key vs live key)

Both test and live environments use the same API URL:
```
https://gate.chip-in.asia/api/v1
```

## Payment Flow

### Standard Flow (Redirect - Recommended)
1. Your app creates a purchase via CHIP API
2. User is redirected to CHIP checkout page
3. User completes payment
4. CHIP redirects back to your `success_callback` URL
5. Your app verifies payment status via API call

### Webhook Flow (Advanced - Optional)
1. Your app creates a purchase via CHIP API
2. User completes payment on CHIP
3. CHIP sends webhook notification to your registered webhook URL
4. Your app verifies webhook signature using `webhook_secret`
5. Your app updates payment status

## Configuration Example

For basic payment processing (most common):
```json
{
  "brand_id": "a5a88724-ed15-4410-a068-cb77da197e08",
  "api_key": "your-encrypted-api-key"
}
```

For webhook-enabled setup:
```json
{
  "brand_id": "a5a88724-ed15-4410-a068-cb77da197e08",
  "api_key": "your-encrypted-api-key",
  "webhook_secret": "your-webhook-public-key"
}
```

## Important Notes

1. **For most implementations, you only need Brand ID and API Key**
2. The `secret_key` field (if present) is NOT used by CHIP - it may be for internal application use
3. Webhook setup is optional and only needed for server-to-server notifications
4. Always verify payment status via API call, even with webhooks, for security
5. All sensitive keys should be encrypted in the database

## Testing

1. Use test Brand ID and test API Key from CHIP sandbox
2. Test payments with CHIP's test card numbers
3. Verify callbacks are received correctly
4. Check payment status verification works

## Security Best Practices

1. Always encrypt API keys in database
2. Verify payment status via API call, not just callback data
3. Use HTTPS for all webhook URLs
4. Implement webhook signature verification if using webhooks
5. Validate all callback parameters before processing
