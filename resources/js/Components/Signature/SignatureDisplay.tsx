import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { router } from '@inertiajs/react';
import { Trash2, FileCheck } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
    signatureType: 'none' | 'computer_generated' | 'live';
    signatureData: string | null;
    signatureName: string | null;
    signedAt: string | null;
    documentType: 'invoice' | 'quotation';
    documentId: number;
    canRemove?: boolean;
}

export default function SignatureDisplay({
    signatureType,
    signatureData,
    signatureName,
    signedAt,
    documentType,
    documentId,
    canRemove = false,
}: Props) {
    if (signatureType === 'none' || !signatureData) {
        return (
            <div className="text-center py-8 text-gray-500 italic">
                <FileCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No signature added</p>
            </div>
        );
    }

    const imageSrc = signatureType === 'computer_generated'
        ? `/storage/${signatureData}`
        : signatureData;

    const handleRemove = () => {
        if (!confirm('Are you sure you want to remove this signature?')) {
            return;
        }

        const routeName = documentType === 'invoice'
            ? 'sales.invoices.signature.remove'
            : 'sales.quotations.signature.remove';

        router.delete(route(routeName, documentId));
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-md p-4 bg-white">
                        <img
                            src={imageSrc}
                            alt="Signature"
                            className="max-w-xs max-h-32 object-contain mx-auto"
                        />
                    </div>

                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Signed by:</span>
                            <span className="text-gray-900">{signatureName}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Signed at:</span>
                            <span className="text-gray-900">
                                {signedAt && format(new Date(signedAt), 'PPp')}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Type:</span>
                            <span className="text-gray-900">
                                {signatureType === 'computer_generated'
                                    ? 'Computer Generated'
                                    : 'Digital Signature'}
                            </span>
                        </div>
                    </div>

                    {canRemove && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemove}
                            className="w-full"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Signature
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
