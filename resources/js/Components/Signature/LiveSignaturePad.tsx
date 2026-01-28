import { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Eraser, PenTool } from 'lucide-react';

interface Props {
    documentType: 'invoice' | 'quotation';
    documentId: number;
}

export default function LiveSignaturePad({ documentType, documentId }: Props) {
    const sigPad = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    const { data, setData, post, processing, errors } = useForm({
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

        const routeName = documentType === 'invoice'
            ? 'sales.invoices.signature.live'
            : 'sales.quotations.signature.live';

        post(route(routeName, documentId), {
            onSuccess: () => {
                clear();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Draw Your Signature</Label>
            </div>

            <Button type="submit" disabled={processing || isEmpty} className="w-full">
                <PenTool className="w-4 h-4 mr-2" />
                {processing ? 'Signing...' : 'Sign Document'}
            </Button>
        </form>
    );
}
