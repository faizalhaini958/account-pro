import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Upload } from 'lucide-react';

interface Props {
    documentType: 'invoice' | 'quotation';
    documentId: number;
    useCompanySignature?: boolean;
    companySignaturePath?: string;
    companySignatureName?: string;
}

export default function ComputerSignatureUpload({
    documentType,
    documentId,
    useCompanySignature = false,
    companySignaturePath,
    companySignatureName
}: Props) {
    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        signature_file: null as File | null,
        signature_name: useCompanySignature ? (companySignatureName || '') : '',
        use_company_signature: useCompanySignature,
        company_signature_path: useCompanySignature ? companySignaturePath : null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('signature_file', file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const routeName = documentType === 'invoice'
            ? 'sales.invoices.signature.computer'
            : 'sales.quotations.signature.computer';

        post(route(routeName, documentId), {
            onSuccess: () => {
                setPreview(null);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!useCompanySignature && (
                <div className="space-y-2">
                    <Label htmlFor="signature-file">Upload Signature Image</Label>
                    <Input
                        id="signature-file"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                        onChange={handleFileChange}
                        required
                    />
                    {errors.signature_file && (
                        <p className="text-sm text-red-600">{errors.signature_file}</p>
                    )}
                    <p className="text-sm text-gray-500">
                        Accepted formats: PNG, JPG, SVG (max 2MB)
                    </p>
                </div>
            )}

            {preview && !useCompanySignature && (
                <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <img
                        src={preview}
                        alt="Signature preview"
                        className="max-w-xs max-h-32 object-contain"
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="signature-name">Signatory Name</Label>
                <Input
                    id="signature-name"
                    type="text"
                    value={data.signature_name}
                    onChange={(e) => setData('signature_name', e.target.value)}
                    placeholder="e.g., John Doe"
                    required
                    disabled={useCompanySignature}
                />
                {errors.signature_name && (
                    <p className="text-sm text-red-600">{errors.signature_name}</p>
                )}
            </div>

            <Button type="submit" disabled={processing} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                {processing ? 'Applying...' : useCompanySignature ? 'Apply Company Signature' : 'Upload Signature'}
            </Button>
        </form>
    );
}
