# Email Template Management - Quick Setup Guide

## 🚀 Getting Started

Follow these steps to enable email template management in your admin panel.

### Step 1: Run Migration

Create the `email_templates` table:

```bash
php artisan migrate
```

**Expected output:** Migration successful for `create_email_templates_table`

### Step 2: Seed Templates

Populate the database with 12 pre-configured email templates:

```bash
php artisan db:seed --class=EmailTemplateSeeder
```

**Expected output:** 12 templates created (auth, subscription, invoice, e-invoice)

### Step 3: Access Admin Panel

1. Log in as **Super Admin**
2. Navigate to **Admin → Email Templates**
3. You should see 12 templates organized by category

### Step 4: Test the Feature

1. **Browse Templates**
   - Filter by category (auth, subscription, invoice, einvoice)
   - Search by name or subject
   - View last updated dates

2. **Edit a Template**
   - Click **Edit** on any template
   - View available variables
   - Modify subject or content
   - Click **Save Changes**

3. **Preview Changes**
   - Click **Preview** button
   - See rendered email with sample data
   - Verify variables are replaced correctly

4. **Test Email Sending** (Optional)
   - Trigger a test email (e.g., password reset)
   - Verify email uses updated content
   - Check formatting and variables

## 📋 What Was Created

### Database
- **Table:** `email_templates` (12 templates)
- **Migration:** `2026_01_20_120000_create_email_templates_table.php`
- **Seeder:** `EmailTemplateSeeder.php`

### Backend
- **Model:** `App\Models\EmailTemplate`
- **Controller:** `App\Http\Controllers\Admin\EmailTemplateController`
- **Trait:** `App\Traits\RendersEmailTemplate`

### Frontend (Admin UI)
- **Index Page:** List all templates with search/filter
- **Edit Page:** Template editor with variable helper
- **Preview Page:** Live preview with sample data

### Routes (Admin Only)
- `GET /admin/email-templates` - List templates
- `GET /admin/email-templates/{id}/edit` - Edit template
- `PUT /admin/email-templates/{id}` - Update template
- `GET /admin/email-templates/{id}/preview` - Preview template
- `POST /admin/email-templates/{id}/reset` - Reset to default

### Views
- `resources/views/emails/layout-content.blade.php` - Email wrapper
- `resources/views/emails/template-wrapper.blade.php` - Content renderer

## ✨ Features

### 1. Visual Template Editor
- Edit email subject and HTML content
- Click variables to copy to clipboard
- Optional description field for notes

### 2. Variable System
All templates support dynamic content:
```html
<p>Hello {{user_name}},</p>
<p>Your {{plan_name}} subscription expires on {{expiry_date}}.</p>
```

### 3. Live Preview
- See rendered email with sample data
- Verify subject and content
- Test before saving

### 4. Category Organization
Templates grouped by purpose:
- **Auth** (2) - Verification, password reset
- **Subscription** (5) - Trial, payments, expiry
- **Invoice** (2) - Sent, reminders
- **e-Invoice** (3) - Submitted, validated, rejected

### 5. Safety Features
- **Active/Inactive toggle** - Disable without deleting
- **Reset to default** - One-click restore
- **Automatic fallback** - Uses hardcoded templates if DB unavailable

## 🎯 Common Use Cases

### Customize Welcome Email
1. Go to Email Templates
2. Find "Trial Started" template
3. Edit content to match your brand voice
4. Preview → Save
5. New signups receive updated email

### Update Payment Failed Message
1. Edit "Payment Failed" template
2. Add custom support contact info
3. Adjust tone or add resources
4. Save changes
5. Users see updated message immediately

### Add Company Branding
1. Edit any template
2. Add logo image: `<img src="https://yourcdn.com/logo.png">`
3. Customize colors in content
4. Preview to verify
5. Save and test

## 📚 Quick Reference

### Template Keys
- `verify-email` - Email verification
- `reset-password` - Password reset
- `trial-started` - Welcome email
- `trial-ending` - Trial reminder
- `payment-successful` - Payment receipt
- `payment-failed` - Payment failure
- `subscription-expired` - Account expired
- `invoice-sent` - Invoice to customer
- `payment-reminder` - Overdue notice
- `einvoice-submitted` - e-Invoice submitted
- `einvoice-validated` - e-Invoice validated
- `einvoice-rejected` - e-Invoice rejected

### Common Variables
- `{{app_name}}` - Application name
- `{{app_url}}` - Base URL
- `{{user_name}}` - User's name
- `{{plan_name}}` - Subscription plan
- `{{amount}}` - Payment amount
- `{{invoice_number}}` - Invoice #

### HTML Styling Classes
- `.button` - Primary action button
- `.info-box` - Highlighted info box
- `.text-muted` - Gray secondary text

## 🔧 Troubleshooting

### Templates Not Showing
```bash
# Clear cache
php artisan cache:clear

# Re-seed if needed
php artisan db:seed --class=EmailTemplateSeeder --force
```

### Changes Not Applying
- Ensure template is **Active** (toggle ON)
- Clear browser cache
- Check SMTP settings are configured

### Variables Not Rendering
- Verify variable name spelling
- Check available variables list
- Ensure variable is supported for that template type

## 📖 Documentation

Full documentation available at:
- **User Guide:** `/docs/EMAIL_TEMPLATE_MANAGEMENT.md`
- **Email System:** `/docs/EMAIL_NOTIFICATIONS.md`
- **Implementation:** `/docs/EMAIL_IMPLEMENTATION_SUMMARY.md`

## ✅ Verification Checklist

After setup, verify:

- [ ] Migration ran successfully
- [ ] Seeder created 12 templates
- [ ] Admin can access `/admin/email-templates`
- [ ] Can edit and save template
- [ ] Preview shows rendered content
- [ ] Variables are replaced in preview
- [ ] Search and filter work
- [ ] Reset to default works
- [ ] Active/inactive toggle works
- [ ] Test email uses updated template

## 🎉 You're Ready!

Email template management is now active. Admins can customize all email content without touching code.

**Next steps:**
1. Review all 12 templates
2. Customize branding as needed
3. Test with real emails
4. Train team on usage

---

**Need Help?** Check `/docs/EMAIL_TEMPLATE_MANAGEMENT.md` for detailed guide.
