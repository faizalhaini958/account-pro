# Signature Feature - Usage Guide

## Quick Start

The signature feature has been successfully implemented for invoices and quotations. Here's how to use it:

### 1. Import the Component

```tsx
import { SignatureManager } from '@/Components/Signature';
```

### 2. Use in Your Invoice/Quotation Pages

Add the component to your invoice or quotation edit/show page:

```tsx
// In your Invoice Show/Edit page
<SignatureManager
    documentType="invoice"
    documentId={invoice.id}
    currentSignature={{
        type: invoice.signature_type,
        data: invoice.signature_data,
        name: invoice.signature_name,
        signedAt: invoice.signed_at,
    }}
    canEdit={true} // Set based on user permissions
/>
```

```tsx
// In your Quotation Show/Edit page
<SignatureManager
    documentType="quotation"
    documentId={quotation.id}
    currentSignature={{
        type: quotation.signature_type,
        data: quotation.signature_data,
        name: quotation.signature_name,
        signedAt: quotation.signed_at,
    }}
    canEdit={true}
/>
```

### 3. Example Integration in Invoice Show Page

```tsx
// resources/js/Pages/Sales/Invoices/Show.tsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { SignatureManager } from '@/Components/Signature';
import { Invoice } from '@/types';

interface Props {
    invoice: Invoice & {
        signature_type: 'none' | 'computer_generated' | 'live';
        signature_data: string | null;
        signature_name: string | null;
        signed_at: string | null;
    };
}

export default function Show({ invoice }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl">
                    Invoice {invoice.number}
                </h2>
            }
        >
            <Head title={`Invoice ${invoice.number}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Invoice Details */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {/* Your existing invoice details */}
                    </div>

                    {/* Signature Section */}
                    <SignatureManager
                        documentType="invoice"
                        documentId={invoice.id}
                        currentSignature={{
                            type: invoice.signature_type,
                            data: invoice.signature_data,
                            name: invoice.signature_name,
                            signedAt: invoice.signed_at,
                        }}
                        canEdit={invoice.status !== 'void'} // Example: disable for void invoices
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

### 4. Update Your TypeScript Types

Add signature fields to your Invoice and Quotation types:

```tsx
// resources/js/types/index.d.ts

export interface Invoice {
    id: number;
    number: string;
    date: string;
    // ... other fields
    signature_type: 'none' | 'computer_generated' | 'live';
    signature_data: string | null;
    signature_name: string | null;
    signed_at: string | null;
}

export interface Quotation {
    id: number;
    number: string;
    date: string;
    // ... other fields
    signature_type: 'none' | 'computer_generated' | 'live';
    signature_data: string | null;
    signature_name: string | null;
    signed_at: string | null;
}
```

### 5. Backend - Pass Signature Data

Update your controller methods to include signature data:

```php
// In SalesInvoiceController.php - show() method
public function show(Invoice $invoice)
{
    $this->authorize('sales.view');

    return Inertia::render('Sales/Invoices/Show', [
        'invoice' => $invoice->load(['customer', 'items']),
    ]);
}
```

The signature fields are already part of the model, so they'll be included automatically.

### 6. PDF Integration

Update your PDF blade view to include the signature:

```blade
{{-- resources/views/pdf/invoice.blade.php --}}

<div class="invoice-content">
    {{-- Your existing invoice content --}}
</div>

@if($invoice->signature_type !== 'none' && $invoice->signature_data)
    <div style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
        <h4 style="margin-bottom: 10px;">Authorized Signature</h4>
        
        <div style="margin-bottom: 10px;">
            @if($invoice->signature_type === 'computer_generated')
                <img src="{{ public_path('storage/' . $invoice->signature_data) }}" 
                     alt="Signature" 
                     style="max-width: 200px; height: auto; border: 1px solid #ddd; padding: 5px;">
            @else
                <img src="{{ $invoice->signature_data }}" 
                     alt="Signature" 
                     style="max-width: 200px; height: auto; border: 1px solid #ddd; padding: 5px;">
            @endif
        </div>
        
        <p style="margin: 5px 0;"><strong>{{ $invoice->signature_name }}</strong></p>
        <p style="margin: 5px 0; font-size: 12px; color: #666;">
            Signed on {{ $invoice->signed_at->format('d M Y, H:i') }}
        </p>
    </div>
@endif
```

## API Endpoints Available

The following routes are now available:

### Invoice Signatures
- `POST /sales/invoices/{invoice}/signature/computer` - Upload signature image
- `POST /sales/invoices/{invoice}/signature/live` - Add drawn signature
- `DELETE /sales/invoices/{invoice}/signature` - Remove signature

### Quotation Signatures
- `POST /sales/quotations/{quotation}/signature/computer` - Upload signature image
- `POST /sales/quotations/{quotation}/signature/live` - Add drawn signature
- `DELETE /sales/quotations/{quotation}/signature` - Remove signature

## Features

✅ **Two Signature Types**
- Computer-generated (pre-uploaded image)
- Live signature (drawn in real-time)

✅ **Complete UI Components**
- `SignatureManager` - Main component with tabs
- `SignatureDisplay` - Shows existing signature
- `LiveSignaturePad` - Draw signature with mouse/touch
- `ComputerSignatureUpload` - Upload signature image

✅ **Backend Ready**
- Database migrations completed
- Models updated
- Controller methods added
- Routes configured

✅ **Security Features**
- File validation (2MB max, PNG/JPG/SVG only)
- Authorization checks
- Automatic cleanup of old signatures
- Audit trail with timestamps

## Testing

To test the feature:

1. Navigate to an invoice or quotation
2. You should see the signature section
3. Try both signature types:
   - Live: Draw with your mouse/trackpad
   - Computer: Upload a PNG/JPG image
4. View the signed document
5. Test the PDF export to ensure signature appears

## Troubleshooting

**Images not uploading?**
- Check that `storage/app/public` is linked: `php artisan storage:link`
- Verify write permissions on storage directory

**TypeScript errors?**
- Make sure to add signature fields to your type definitions
- Run `npm run build` to recompile

**Routes not working?**
- Clear route cache: `php artisan route:clear`
- Check middleware permissions

## Next Steps

1. Add signature fields to your Invoice/Quotation show/edit pages
2. Update PDF templates to display signatures
3. Consider adding email notifications when documents are signed
4. Optionally restrict who can sign (e.g., only managers)

For detailed implementation examples, see `docs/SIGNATURE_IMPLEMENTATION.md`
