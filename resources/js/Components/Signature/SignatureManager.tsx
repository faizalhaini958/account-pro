import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
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
    companySignature?: {
        path: string | null;
        name: string | null;
        url: string | null;
    };
    canEdit?: boolean;
}

export default function SignatureManager({
    documentType,
    documentId,
    currentSignature,
    companySignature,
    canEdit = true,
}: Props) {
    const hasSignature = currentSignature.type !== 'none';
    const hasCompanySignature = companySignature?.path && companySignature?.url;

    if (hasSignature) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Document Signature</CardTitle>
                    <CardDescription>
                        This document has been signed
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SignatureDisplay
                        signatureType={currentSignature.type}
                        signatureData={currentSignature.data}
                        signatureName={currentSignature.name}
                        signedAt={currentSignature.signedAt}
                        documentType={documentType}
                        documentId={documentId}
                        canRemove={canEdit}
                    />
                </CardContent>
            </Card>
        );
    }

    if (!canEdit) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Document Signature</CardTitle>
                    <CardDescription>
                        No signature has been added to this document
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add Signature</CardTitle>
                <CardDescription>
                    Choose how you want to sign this document
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={hasCompanySignature ? "company" : "live"} className="w-full">
                    <TabsList className={`grid w-full ${hasCompanySignature ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        {hasCompanySignature && (
                            <TabsTrigger value="company">Company Signature</TabsTrigger>
                        )}
                        <TabsTrigger value="live">Live Signature</TabsTrigger>
                        <TabsTrigger value="upload">Upload Signature</TabsTrigger>
                    </TabsList>

                    {hasCompanySignature && (
                        <TabsContent value="company" className="mt-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600 mb-4">
                                        Use your company's default signature from settings.
                                    </p>
                                    <div className="border border-gray-200 rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                                        <p className="text-sm font-medium mb-2">Company Signature Preview:</p>
                                        <img
                                            src={companySignature.url!}
                                            alt="Company signature"
                                            className="max-w-xs max-h-32 object-contain"
                                        />
                                        {companySignature.name && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                Signatory: <strong>{companySignature.name}</strong>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <ComputerSignatureUpload
                                    documentType={documentType}
                                    documentId={documentId}
                                    useCompanySignature={true}
                                    companySignaturePath={companySignature.path!}
                                    companySignatureName={companySignature.name!}
                                />
                            </div>
                        </TabsContent>
                    )}

                    <TabsContent value="live" className="mt-4">
                        <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600">
                                Draw your signature using your mouse, trackpad, or touchscreen.
                            </p>
                        </div>
                        <LiveSignaturePad
                            documentType={documentType}
                            documentId={documentId}
                        />
                    </TabsContent>

                    <TabsContent value="upload" className="mt-4">
                        <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600">
                                Upload a signature image file for this document only.
                            </p>
                        </div>
                        <ComputerSignatureUpload
                            documentType={documentType}
                            documentId={documentId}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
