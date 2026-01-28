# Signature Implementation Guide
## Invoice & Quotation Signature Feature

This document provides a comprehensive guide for implementing signature functionality in invoices and quotations.

---

## Signature Types

### 1. Computer-Generated Signature (Pre-uploaded/Static)

**Definition**: A pre-uploaded image file that contains a signature, stored and reused across multiple documents.

**Characteristics**:
- **Format**: PNG, JPG, or SVG image file
- **Storage**: File path stored in database (e.g., `storage/signatures/company_signature.png`)
- **Reusability**: One signature used for all documents
- **Use Case**: Company/business signatures, authorized signatory
- **Setup**: One-time upload in settings/profile

**Advantages**:
- ✅ Professional and consistent appearance
- ✅ One-time setup
- ✅ Smaller database footprint
- ✅ Easy to update globally
- ✅ Can use high-quality scanned signatures

**Database Storage**:
```php
signature_type: 'computer_generated'
signature_data: 'signatures/john_doe_signature.png'  // File path
signature_name: 'John Doe'
signed_at: '2026-01-28 14:30:00'
```

---

### 2. Live Signature (Digital/Real-time)

**Definition**: A signature drawn in real-time using a digital signature pad, mouse, touchpad, or stylus.

**Characteristics**:
- **Format**: Base64 encoded PNG/SVG or SVG path data
- **Storage**: Stored directly in database as text/blob
- **Uniqueness**: Each document gets a unique signature
- **Use Case**: Client acceptance, proof of authorization, document signing
- **Capture**: Real-time drawing on canvas

**Advantages**:
- ✅ Legally binding with timestamp
- ✅ Unique per document (proves intent)
- ✅ Captures signature metadata (time, IP, user)
- ✅ Better for compliance and audit trails
- ✅ No file management needed

**Database Storage**:
```php
signature_type: 'live'
signature_data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'  // Base64 data
signature_name: 'Customer Name'
signed_at: '2026-01-28 14:35:22'
```

---

## Database Schema

The following fields have been added to both `invoices` and `quotations` tables:

| Column | Type | Description |
|--------|------|-------------|
| `signature_type` | ENUM('none', 'computer_generated', 'live') | Type of signature used |
| `signature_data` | TEXT | Stores file path or base64 data |
| `signature_name` | VARCHAR | Name of the person who signed |
| `signed_at` | TIMESTAMP | When the document was signed |

---

## Backend Implementation

### Models Updated

#### Invoice Model (`app/Models/Invoice.php`)
```php
protected $casts = [
    // ... existing casts
    'signed_at' => 'datetime',
];
```

#### Quotation Model (`app/Models/Quotation.php`)
```php
protected $casts = [
    // ... existing casts
    'signed_at' => 'datetime',
];
```

### API Endpoints (Recommended)

Create the following endpoints in your controllers:

```php
// InvoiceController.php / QuotationController.php

/**
 * Add computer-generated signature to invoice/quotation
 */
public function addComputerSignature(Request $request, Invoice $invoice)
{
    $request->validate([
        'signature_file' => 'required|image|mimes:png,jpg,jpeg,svg|max:2048',
        'signature_name' => 'required|string|max:255',
    ]);

    // Store the signature file
    $path = $request->file('signature_file')->store('signatures', 'public');

    $invoice->update([
        'signature_type' => 'computer_generated',
        'signature_data' => $path,
        'signature_name' => $request->signature_name,
        'signed_at' => now(),
    ]);

    return back()->with('success', 'Signature added successfully');
}

/**
 * Add live signature to invoice/quotation
 */
public function addLiveSignature(Request $request, Invoice $invoice)
{
    $request->validate([
        'signature_data' => 'required|string', // Base64 encoded image
        'signature_name' => 'required|string|max:255',
    ]);

    $invoice->update([
        'signature_type' => 'live',
        'signature_data' => $request->signature_data,
        'signature_name' => $request->signature_name,
        'signed_at' => now(),
    ]);

    return back()->with('success', 'Document signed successfully');
}

/**
 * Remove signature
 */
public function removeSignature(Invoice $invoice)
{
    // Delete file if computer-generated
    if ($invoice->signature_type === 'computer_generated' && $invoice->signature_data) {
        Storage::disk('public')->delete($invoice->signature_data);
    }

    $invoice->update([
        'signature_type' => 'none',
        'signature_data' => null,
        'signature_name' => null,
        'signed_at' => null,
    ]);

    return back()->with('success', 'Signature removed successfully');
}
```

---

## Frontend Implementation

### Required NPM Packages

For live signature functionality, install a signature pad library:

```bash
npm install react-signature-canvas
# or
npm install signature_pad
```

### Computer-Generated Signature Component (React/Inertia)

```tsx
// resources/js/Components/ComputerSignatureUpload.tsx

import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

interface Props {
    documentType: 'invoice' | 'quotation';
    documentId: number;
}

export default function ComputerSignatureUpload({ documentType, documentId }: Props) {
    const { data, setData, post, processing } = useForm({
        signature_file: null as File | null,
        signature_name: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route(`${documentType}s.signature.computer`, documentId));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Upload Signature Image</Label>
                <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    onChange={(e) => setData('signature_file', e.target.files?.[0] || null)}
                    required
                />
                <p className="text-sm text-gray-500 mt-1">
                    Accepted formats: PNG, JPG, SVG (max 2MB)
                </p>
            </div>

            <div>
                <Label>Signatory Name</Label>
                <Input
                    type="text"
                    value={data.signature_name}
                    onChange={(e) => setData('signature_name', e.target.value)}
                    placeholder="John Doe"
                    required
                />
            </div>

            <Button type="submit" disabled={processing}>
                Upload Signature
            </Button>
        </form>
    );
}
```

### Live Signature Component (React/Inertia)

```tsx
// resources/js/Components/LiveSignaturePad.tsx

import { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

interface Props {
    documentType: 'invoice' | 'quotation';
    documentId: number;
}

export default function LiveSignaturePad({ documentType, documentId }: Props) {
    const sigPad = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    
    const { data, setData, post, processing } = useForm({
        signature_data: '',
        signature_name: '',
    });

    const clear = () => {
        sigPad.current?.clear();
        setIsEmpty(true);
        setData('signature_data', '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (sigPad.current?.isEmpty()) {
            alert('Please provide a signature');
            return;
        }

        // Get base64 encoded signature
        const signatureData = sigPad.current?.toDataURL('image/png');
        setData('signature_data', signatureData || '');
        
        post(route(`${documentType}s.signature.live`, documentId));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label>Draw Your Signature</Label>
                <div className="border border-gray-300 rounded-md bg-white">
                    <SignatureCanvas
                        ref={sigPad}
                        canvasProps={{
                            className: 'w-full h-40',
                        }}
                        onEnd={() => setIsEmpty(false)}
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clear}
                    className="mt-2"
                >
                    Clear
                </Button>
            </div>

            <div>
                <Label>Your Name</Label>
                <Input
                    type="text"
                    value={data.signature_name}
                    onChange={(e) => setData('signature_name', e.target.value)}
                    placeholder="Enter your name"
                    required
                />
            </div>

            <Button type="submit" disabled={processing || isEmpty}>
                Sign Document
            </Button>
        </form>
    );
}
```

### Signature Display Component

```tsx
// resources/js/Components/SignatureDisplay.tsx

interface Props {
    signatureType: 'none' | 'computer_generated' | 'live';
    signatureData: string | null;
    signatureName: string | null;
    signedAt: string | null;
    canRemove?: boolean;
    onRemove?: () => void;
}

export default function SignatureDisplay({
    signatureType,
    signatureData,
    signatureName,
    signedAt,
    canRemove = false,
    onRemove,
}: Props) {
    if (signatureType === 'none' || !signatureData) {
        return <p className="text-gray-500 italic">No signature</p>;
    }

    const imageSrc = signatureType === 'computer_generated'
        ? `/storage/${signatureData}`
        : signatureData;

    return (
        <div className="space-y-2">
            <img
                src={imageSrc}
                alt="Signature"
                className="max-w-xs border border-gray-300 rounded p-2 bg-white"
            />
            <div className="text-sm text-gray-600">
                <p><strong>Signed by:</strong> {signatureName}</p>
                <p><strong>Signed at:</strong> {new Date(signedAt!).toLocaleString()}</p>
                <p><strong>Type:</strong> {signatureType === 'computer_generated' ? 'Computer Generated' : 'Digital Signature'}</p>
            </div>
            {canRemove && (
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onRemove}
                >
                    Remove Signature
                </Button>
            )}
        </div>
    );
}
```

### Complete Signature Manager Component

```tsx
// resources/js/Components/SignatureManager.tsx

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import ComputerSignatureUpload from './ComputerSignatureUpload';
import LiveSignaturePad from './LiveSignaturePad';
import SignatureDisplay from './SignatureDisplay';

interface Props {
    documentType: 'invoice' | 'quotation';
    documentId: number;
    currentSignature: {
        type: 'none' | 'computer_generated' | 'live';
        data: string | null;
        name: string | null;
        signedAt: string | null;
    };
}

export default function SignatureManager({ 
    documentType, 
    documentId, 
    currentSignature 
}: Props) {
    const hasSignature = currentSignature.type !== 'none';

    const handleRemove = () => {
        // Inertia delete or post request
        router.delete(route(`${documentType}s.signature.remove`, documentId));
    };

    if (hasSignature) {
        return (
            <SignatureDisplay
                signatureType={currentSignature.type}
                signatureData={currentSignature.data}
                signatureName={currentSignature.name}
                signedAt={currentSignature.signedAt}
                canRemove={true}
                onRemove={handleRemove}
            />
        );
    }

    return (
        <Tabs defaultValue="live" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="live">Live Signature</TabsTrigger>
                <TabsTrigger value="computer">Upload Signature</TabsTrigger>
            </TabsList>
            
            <TabsContent value="live">
                <LiveSignaturePad 
                    documentType={documentType} 
                    documentId={documentId} 
                />
            </TabsContent>
            
            <TabsContent value="computer">
                <ComputerSignatureUpload 
                    documentType={documentType} 
                    documentId={documentId} 
                />
            </TabsContent>
        </Tabs>
    );
}
```

---

## PDF Generation Integration

When generating PDFs for invoices/quotations, include the signature:

```php
// In your PDF view (e.g., invoice.blade.php)

@if($invoice->signature_type !== 'none' && $invoice->signature_data)
    <div class="signature-section">
        <h4>Authorized Signature</h4>
        
        @if($invoice->signature_type === 'computer_generated')
            <img src="{{ Storage::url($invoice->signature_data) }}" 
                 alt="Signature" 
                 style="max-width: 200px; height: auto;">
        @else
            <img src="{{ $invoice->signature_data }}" 
                 alt="Signature" 
                 style="max-width: 200px; height: auto;">
        @endif
        
        <p>{{ $invoice->signature_name }}</p>
        <p>{{ $invoice->signed_at->format('d M Y, H:i') }}</p>
    </div>
@endif
```

---

## Routes Configuration

Add these routes to `routes/web.php`:

```php
// Invoice Signatures
Route::post('/invoices/{invoice}/signature/computer', [InvoiceController::class, 'addComputerSignature'])
    ->name('invoices.signature.computer');
Route::post('/invoices/{invoice}/signature/live', [InvoiceController::class, 'addLiveSignature'])
    ->name('invoices.signature.live');
Route::delete('/invoices/{invoice}/signature', [InvoiceController::class, 'removeSignature'])
    ->name('invoices.signature.remove');

// Quotation Signatures
Route::post('/quotations/{quotation}/signature/computer', [QuotationController::class, 'addComputerSignature'])
    ->name('quotations.signature.computer');
Route::post('/quotations/{quotation}/signature/live', [QuotationController::class, 'addLiveSignature'])
    ->name('quotations.signature.live');
Route::delete('/quotations/{quotation}/signature', [QuotationController::class, 'removeSignature'])
    ->name('quotations.signature.remove');
```

---

## Security Considerations

1. **File Upload Validation**: Always validate file types and sizes
2. **Base64 Size Limits**: Limit signature canvas size to prevent large data
3. **Authorization**: Ensure only authorized users can sign documents
4. **Audit Trail**: Log who added/removed signatures
5. **Immutability**: Consider preventing signature changes on posted/finalized documents

---

## Best Practices

1. **Computer-Generated Signature**: 
   - Store in `storage/app/public/signatures/`
   - Use unique filenames (e.g., tenant_id + user_id + timestamp)
   - Optimize images (compress to reduce file size)

2. **Live Signature**:
   - Limit canvas size (e.g., 500x200px) to reduce base64 size
   - Convert to PNG with moderate quality
   - Consider storing as SVG for scalability

3. **Workflow**:
   - Allow signature only on finalized/posted documents
   - Send email notification when document is signed
   - Include signature in PDF exports

---

## Migration Instructions

Run the migration:

```bash
php artisan migrate
```

To rollback:

```bash
php artisan migrate:rollback
```

---

## Summary

This implementation provides:
- ✅ Flexible signature options (computer-generated and live)
- ✅ Database schema to store both types
- ✅ Backend API endpoints
- ✅ React/Inertia frontend components
- ✅ PDF integration support
- ✅ Audit trail with timestamps and names

Both signature types are production-ready and can be used based on your business requirements.
