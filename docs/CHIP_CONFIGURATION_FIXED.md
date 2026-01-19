# CHIP Payment Gateway - Corrected Configuration

## ⚠️ Important Update

The CHIP payment gateway configuration has been corrected to match the **official CHIP PHP SDK** requirements.

## Previous vs Current Configuration

### ❌ Old Configuration (INCORRECT)
```
Brand ID       ✅ Required
API Key        ✅ Required  
Secret Key     ❌ NOT USED BY CHIP SDK
Webhook Secret ⚠️ Optional
Webhook URL    ⚠️ Optional
```

### ✅ New Configuration (CORRECT)
```
Brand ID       ✅ Required
API Key        ✅ Required
Webhook Secret ⚠️ Optional (only if using webhooks)
Webhook URL    ⚠️ Optional (only if using webhooks)
```

## What Changed?

### 1. Removed "Secret Key" Field
The **"Secret Key" field has been removed** because:
- The official CHIP PHP SDK does NOT use a "secret_key" field
- CHIP only requires `brand_id` and `api_key` for authentication
- This field was added by mistake and caused confusion

### 2. Clarified Optional Fields
Updated field descriptions to clearly indicate:
- **Brand ID** and **API Key** are REQUIRED
- **Webhook Secret** and **Webhook URL** are OPTIONAL (only needed for webhook notifications)

## Required Configuration

### Brand ID ✅ **REQUIRED**
- **Purpose**: Identifies your business in CHIP system
- **Where to get**: CHIP Dashboard → Settings → API Credentials
- **Example**: `brand_1a2b3c4d`

### API Key ✅ **REQUIRED**
- **Purpose**: Authenticates all API requests to CHIP
- **Where to get**: CHIP Dashboard → Settings → API Credentials
- **Security**: Encrypted in database
- **Example**: `sk_live_1a2b3c4d...`

## Optional Configuration (Webhooks)

### Webhook Secret ⚠️ **OPTIONAL**
- **When needed**: Only if you enable webhook notifications in CHIP dashboard
- **Purpose**: Verify webhook signatures to ensure webhooks are from CHIP
- **What it is**: This is the PUBLIC KEY you receive when registering a webhook URL
- **Note**: Despite the name "secret", this is actually a public verification key
- **Example**: `pk_webhook_1a2b3c4d...`

### Webhook URL ⚠️ **OPTIONAL**
- **When needed**: Only if you want real-time payment status updates
- **Purpose**: The endpoint where CHIP sends payment notifications
- **Format**: `https://your-domain.com/payment/chip/webhook`
- **Setup**: Register this URL in CHIP Dashboard → Settings → Webhooks

## Do I Need Webhooks?

### Without Webhooks (Simpler Setup)
- ✅ Create payments and redirect users to CHIP
- ✅ Get payment status via redirect callback
- ✅ Poll CHIP API for payment status
- ❌ No real-time notifications
- ❌ Slight delay in subscription activation

### With Webhooks (Recommended for Production)
- ✅ Real-time payment status updates
- ✅ Instant subscription activation
- ✅ More reliable than polling
- ✅ Better user experience
- ⚠️ Requires public webhook URL
- ⚠️ Additional setup in CHIP dashboard

## How to Configure

### Step 1: Get CHIP Credentials
1. Login to [CHIP Dashboard](https://gate.chip-in.asia/)
2. Navigate to **Settings → API Credentials**
3. Copy your **Brand ID** and **API Key**

### Step 2: Configure in Admin Panel
1. Go to **Admin → Settings → Payment Gateways**
2. Click **Configure** on CHIP Payment Gateway
3. Enter your **Brand ID** (required)
4. Enter your **API Key** (required)
5. Leave webhook fields empty (unless using webhooks - see Step 3)
6. Toggle **Active** to enable the gateway
7. Set **Sandbox Mode** ON for testing, OFF for production
8. Click **Save**

### Step 3: Configure Webhooks (Optional)
1. In CHIP Dashboard, go to **Settings → Webhooks**
2. Add webhook URL: `https://your-domain.com/payment/chip/webhook`
3. CHIP will provide a **webhook secret** (public key)
4. In your Admin Panel, enter the webhook secret in **Webhook Secret** field
5. Enter your webhook URL in **Webhook URL** field
6. Save configuration

## Testing Your Configuration

### Test Connection
1. After entering Brand ID and API Key
2. Click **Test** button in Payment Gateways page
3. System will verify credentials with CHIP
4. You should see: "CHIP connection successful!"

### Test Payment
1. Create a test subscription or invoice
2. Select CHIP as payment method
3. Complete test payment (use test card if in sandbox mode)
4. Verify payment status updates correctly

## Migration Notes

### For Existing Installations
If you have existing CHIP gateway configuration with "Secret Key":

1. The "Secret Key" field will be ignored (not sent to CHIP)
2. Update your configuration:
   - Keep Brand ID and API Key as-is
   - Remove/clear the Secret Key field
   - Verify webhook fields are correct (if using webhooks)
3. Run the seeder to update configuration:
   ```bash
   php artisan db:seed --class=PaymentGatewaySeeder
   ```

### Database Changes
The seeder has been updated to:
- Remove `secret_key` from CHIP configuration
- Add comments explaining required vs optional fields
- Keep existing Kipple Pay configuration unchanged

## Technical Details

### Files Modified
1. `database/seeders/PaymentGatewaySeeder.php`
   - Removed `secret_key` field
   - Added clarifying comments

2. `resources/js/Pages/Admin/Settings/PaymentGateways/Edit.tsx`
   - Removed "Secret Key" field from CHIP form
   - Updated field labels and descriptions
   - Added visual indicators (✅/⚠️) for required/optional fields

3. `app/Http/Controllers/Admin/PaymentGatewayController.php`
   - Already correct: only validates `brand_id` and `api_key`

4. `app/Services/Payment/ChipGateway.php`
   - Already correct: only uses `brand_id` and `api_key`
   - Webhook verification logic ready (if needed)

### API Usage
The ChipGateway service uses only:
```php
$brandId = $gateway->getDecryptedConfig('brand_id');
$apiKey = $gateway->getDecryptedConfig('api_key');
```

Webhook secret (if configured) is used only in webhook verification:
```php
$webhookSecret = $gateway->getDecryptedConfig('webhook_secret');
// Used to verify X-Signature header
```

## Support

### Official CHIP Resources
- **SDK**: [github.com/CHIPAsia/chip-php-sdk](https://github.com/CHIPAsia/chip-php-sdk)
- **API Docs**: [developer.chip-in.asia](https://developer.chip-in.asia/)
- **Dashboard**: [gate.chip-in.asia](https://gate.chip-in.asia/)

### Common Issues

**Q: Connection test fails**
- Verify Brand ID and API Key are correct
- Check you're using correct mode (sandbox vs live credentials)
- Ensure credentials match the selected mode

**Q: Do I need a "secret key"?**
- **No!** CHIP does not use a "secret key" field
- Only Brand ID and API Key are needed for payments

**Q: What is "Webhook Secret"?**
- It's the public key CHIP gives you when registering a webhook
- Only needed if using webhooks
- Used to verify webhook signatures

**Q: Can I use CHIP without webhooks?**
- **Yes!** Webhooks are completely optional
- You can use redirect-based flow without webhooks
- Just leave webhook fields empty
