# Email Template Management System

## Overview

The Email Template Management feature allows administrators to customize all email content directly from the admin panel without modifying code. This provides flexibility to adjust messaging, branding, and content for different audiences.

## Features

✅ **Visual Template Editor** - Edit email subject and content from admin panel  
✅ **12 Pre-configured Templates** - All essential emails are ready to use  
✅ **Variable System** - Dynamic content using `{{variable_name}}` syntax  
✅ **Live Preview** - See how emails will look before saving  
✅ **Category Organization** - Templates grouped by type (auth, subscription, invoice, e-invoice)  
✅ **Reset to Default** - One-click restore if changes need to be reverted  
✅ **Active/Inactive Toggle** - Temporarily disable templates  
✅ **Search & Filter** - Quickly find templates  
✅ **Automatic Fallback** - Uses hardcoded templates if database is unavailable

## Accessing Template Management

### Admin Panel Navigation
1. Log in as Super Admin
2. Navigate to **Admin → Email Templates**
3. Browse, search, or filter templates
4. Click **Edit** to modify a template

### URL
Direct access: `https://your-domain.com/admin/email-templates`

## Available Templates

### Authentication (2 templates)
- **Email Verification** - Sent when users register
- **Password Reset** - Sent when password reset is requested

### Subscription (5 templates)
- **Trial Started** - Welcome email when trial begins
- **Trial Ending** - Reminders at 7, 3, and 1 days before trial ends
- **Payment Successful** - Confirmation when payment is processed
- **Payment Failed** - Alert when payment fails with action steps
- **Subscription Expired** - Notice when subscription expires

### Invoices (2 templates)
- **Invoice Sent** - Sent to customers with invoice PDF
- **Payment Reminder** - Sent for overdue invoices

### e-Invoice (3 templates)
- **e-Invoice Submitted** - Confirmation of submission to LHDN
- **e-Invoice Validated** - Success notification from LHDN
- **e-Invoice Rejected** - Failure notification with error details

## Using Variables

Templates support dynamic content using double curly braces: `{{variable_name}}`

### Example
```html
<p>Hello {{user_name}},</p>
<p>Your subscription to {{plan_name}} will renew on {{next_billing_date}}.</p>
```

### Common Variables

**All Templates:**
- `{{app_name}}` - Application name (BukuKira)
- `{{app_url}}` - Base URL

**User-related:**
- `{{user_name}}` - User's full name

**Subscription:**
- `{{plan_name}}` - Subscription plan name
- `{{price}}` - Price formatted with currency
- `{{billing_cycle}}` - monthly/yearly
- `{{trial_end_date}}` - When trial ends
- `{{next_billing_date}}` - Next payment date

**Payments:**
- `{{transaction_id}}` - Payment transaction ID
- `{{amount}}` - Payment amount
- `{{payment_date}}` - When payment was made
- `{{reason}}` - Failure reason (for failed payments)

**Invoices:**
- `{{customer_name}}` - Customer name
- `{{invoice_number}}` - Invoice number
- `{{invoice_date}}` - Invoice date
- `{{due_date}}` - Payment due date
- `{{total_amount}}` - Total invoice amount
- `{{currency}}` - Currency code (MYR)
- `{{days_overdue}}` - Days past due date

**e-Invoice:**
- `{{uuid}}` - LHDN UUID
- `{{submission_id}}` - Submission ID
- `{{status}}` - Current status
- `{{submitted_at}}` - Submission timestamp
- `{{validated_at}}` - Validation timestamp
- `{{error_message}}` - Error details (for rejections)

### Viewing Available Variables
When editing a template, click **"Show Available Variables"** to see all variables for that specific template. Click any variable to copy it to clipboard.

## Editing Templates

### Step-by-Step

1. **Navigate to Email Templates**
   - Go to Admin → Email Templates

2. **Select Template**
   - Use search or filter by category
   - Click **Edit** on desired template

3. **Modify Content**
   - **Template Name**: Display name in admin panel
   - **Subject**: Email subject line (supports variables)
   - **Content**: Email body in HTML (supports variables)
   - **Description**: Optional notes about template usage

4. **Preview Changes**
   - Click **Preview** button
   - See how email will look with sample data

5. **Save**
   - Click **Save Changes**
   - Template is immediately active

### HTML Styling

Templates support HTML and CSS. Common elements:

```html
<!-- Heading -->
<h1>Main Title</h1>

<!-- Paragraph -->
<p>Regular text content</p>

<!-- Button -->
<a href="{{app_url}}/dashboard" class="button">Go to Dashboard</a>

<!-- Info Box -->
<div class="info-box">
    <p><strong>Important:</strong> Key information here</p>
</div>

<!-- Muted Text -->
<p class="text-muted">Secondary information</p>

<!-- Lists -->
<ul>
    <li>First item</li>
    <li>Second item</li>
</ul>
```

### Available CSS Classes

- `.button` - Primary action button (black background, white text)
- `.info-box` - Highlighted box with left border
- `.text-muted` - Gray secondary text
- Standard HTML: `<h1>`, `<p>`, `<ul>`, `<ol>`, `<strong>`, etc.

## Previewing Templates

The preview feature shows how emails will appear to recipients:

1. Click **Preview** on any template
2. See rendered email with sample data
3. Check both subject line and content
4. Return to edit if changes needed

**Note:** Preview uses sample/dummy data. Actual emails use real data.

## Resetting Templates

If you make changes and want to revert:

1. Open the template editor
2. Click **Reset to Default**
3. Confirm the action
4. Template returns to original content

**Warning:** This action cannot be undone. Consider copying content before resetting.

## Managing Template Status

### Activating/Deactivating Templates

Toggle the **"Template is active"** switch:
- **Active** (ON): Template will be used for emails
- **Inactive** (OFF): System uses fallback template

Use this to temporarily disable customizations without losing edits.

## Database Structure

### Table: `email_templates`

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| key | string | Unique identifier (e.g., 'verify-email') |
| name | string | Display name |
| category | string | Template category |
| subject | string | Email subject |
| content | text | HTML content |
| variables | json | Available variables |
| description | text | Help text |
| is_active | boolean | Active status |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

## Setup & Installation

### 1. Run Migration
```bash
php artisan migrate
```

### 2. Seed Templates
```bash
php artisan db:seed --class=EmailTemplateSeeder
```

### 3. Verify Access
- Log in as Super Admin
- Navigate to Admin → Email Templates
- Confirm 12 templates are visible

## How It Works

### Template Resolution Flow

1. **Email Triggered** - User action triggers notification
2. **Load Template** - System queries database for template by key
3. **Render Content** - Variables replaced with actual data
4. **Wrap Layout** - Content wrapped with BukuKira email layout
5. **Send Email** - Email sent via configured SMTP

### Fallback System

If database template is not found or inactive:
- System uses hardcoded Blade template
- Ensures emails always send
- No disruption if database is unavailable

### Example Flow: Password Reset

```
User clicks "Forgot Password"
    ↓
System loads template 'reset-password'
    ↓
Replaces {{reset_url}} with actual link
    ↓
Wraps in branded email layout
    ↓
Sends email to user
```

## Best Practices

### Content Guidelines

✅ **Keep it clear and concise**  
✅ **Use friendly, professional tone**  
✅ **Include clear call-to-action**  
✅ **Test with preview before saving**  
✅ **Maintain consistent branding**

❌ **Avoid overly technical jargon**  
❌ **Don't make emails too long**  
❌ **Don't remove critical information**  
❌ **Don't delete required variables**

### Testing Changes

1. Edit template
2. Save changes
3. Use preview to verify
4. Test with real email (if possible)
5. Monitor user feedback

### Variable Safety

- Always include required variables for each template
- Check preview shows correct data
- Test email sends successfully
- Variables in wrong templates won't render

### Backup Strategy

Before major edits:
1. Copy current content to notepad
2. Make changes
3. Test thoroughly
4. Keep backup until verified working

## Troubleshooting

### Template Not Updating

**Problem:** Changes saved but emails still show old content  
**Solution:**
- Clear application cache: `php artisan cache:clear`
- Verify template is active
- Check correct template was edited

### Variables Not Rendering

**Problem:** `{{variable}}` appears literally in email  
**Solution:**
- Verify variable name is correct (check available variables)
- Ensure no typos in variable name
- Confirm variable is supported for that template

### Preview Shows Error

**Problem:** Preview page doesn't load  
**Solution:**
- Check database connection
- Verify template exists in database
- Review server logs for errors

### Email Not Sending

**Problem:** Template edited but no emails received  
**Solution:**
- This is likely an SMTP issue, not template issue
- Check SMTP settings: Admin → Settings → SMTP
- Test email sending functionality
- Review email logs

## Migration Guide

### From Blade Templates to Database

If updating existing emails to use database templates:

1. **Backup Current Templates**
   ```bash
   cp -r resources/views/emails resources/views/emails.backup
   ```

2. **Run Seeder**
   ```bash
   php artisan db:seed --class=EmailTemplateSeeder
   ```

3. **Update Notifications**
   - Add `use RendersEmailTemplate` trait
   - Implement `renderEmailFromTemplate()` method
   - Implement `fallbackMessage()` for safety

4. **Test All Templates**
   - Verify each template in admin panel
   - Test preview for each
   - Send test emails if possible

## API Reference

### Model Methods

```php
// Get template by key
EmailTemplate::getByKey('verify-email');

// Get templates by category
EmailTemplate::getByCategory('subscription');

// Render template with data
$template->render(['user_name' => 'John']);

// Render subject
$template->renderSubject(['plan_name' => 'Pro']);
```

### Controller Routes

- `GET /admin/email-templates` - List templates
- `GET /admin/email-templates/{id}/edit` - Edit form
- `PUT /admin/email-templates/{id}` - Update template
- `GET /admin/email-templates/{id}/preview` - Preview
- `POST /admin/email-templates/{id}/reset` - Reset to default

## Support

### Common Questions

**Q: Can I add new templates?**  
A: Currently, templates are seeded. Adding new ones requires code changes.

**Q: Can I delete templates?**  
A: No, to ensure system emails continue working. Use inactive status instead.

**Q: Are changes immediate?**  
A: Yes, changes apply to next email sent.

**Q: Can I use images?**  
A: Yes, use `<img src="url">` tags with absolute URLs.

**Q: What about translations?**  
A: Currently templates are in English. Multi-language support requires additional development.

### Getting Help

For issues or questions:
- Review this documentation
- Check preview feature
- Test with sample emails
- Contact development team

---

**Version:** 1.0.0  
**Last Updated:** January 20, 2026  
**Feature Status:** Production Ready ✅
