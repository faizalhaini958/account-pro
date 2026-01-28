<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\EInvoiceDocument;
use App\Models\Tenant;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class EInvoiceService
{
    /**
     * Prepare e-Invoice document from invoice
     */
    public function prepareEInvoice(Invoice $invoice): EInvoiceDocument
    {
        $tenant = Tenant::find($invoice->tenant_id);
        
        // Generate e-Invoice JSON payload (LHDN format)
        $einvoiceData = $this->generateEInvoiceJSON($invoice, $tenant);
        
        // Validate the data
        $validationErrors = $this->validate($einvoiceData);
        
        // Create or update e-Invoice document
        $document = EInvoiceDocument::updateOrCreate(
            ['invoice_id' => $invoice->id],
            [
                'tenant_id' => $invoice->tenant_id,
                'document_type' => 'invoice',
                'einvoice_data' => $einvoiceData,
                'status' => empty($validationErrors) ? 'prepared' : 'not_prepared',
                'validation_errors' => empty($validationErrors) ? null : implode(', ', $validationErrors),
            ]
        );
        
        // Generate QR code if prepared successfully
        if ($document->status === 'prepared') {
            $qrCode = $this->generateQRCode($document);
            $invoice->update(['einvoice_qr_code' => $qrCode]);
        }
        
        return $document;
    }
    
    /**
     * Generate e-Invoice JSON in LHDN format
     */
    protected function generateEInvoiceJSON(Invoice $invoice, Tenant $tenant): array
    {
        return [
            '_D' => 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
            '_A' => 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
            '_B' => 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
            
            'Invoice' => [
                'ID' => [$invoice->reference_number],
                'IssueDate' => [$invoice->date->format('Y-m-d')],
                'IssueTime' => [$invoice->created_at->format('H:i:s') . 'Z'],
                'InvoiceTypeCode' => ['01'], // 01 = Invoice, 02 = Credit Note, 03 = Debit Note
                'DocumentCurrencyCode' => ['MYR'],
                
                // Supplier (Tenant)
                'AccountingSupplierParty' => [
                    'Party' => [
                        'IndustryClassificationCode' => [$tenant->einvoice_classification ?? '00000'],
                        'PartyIdentification' => [
                            ['ID' => [$tenant->tin], '_attributes' => ['schemeID' => 'TIN']],
                            ['ID' => [$tenant->brn], '_attributes' => ['schemeID' => 'BRN']],
                        ],
                        'PostalAddress' => [
                            'AddressLine' => [['Line' => [$tenant->address ?? '']]],
                            'CityName' => [$tenant->city ?? ''],
                            'PostalZone' => [$tenant->postcode ?? ''],
                            'CountrySubentityCode' => [$tenant->state ?? ''],
                            'Country' => [['IdentificationCode' => ['MYS']]],
                        ],
                        'PartyLegalEntity' => [
                            ['RegistrationName' => [$tenant->name]],
                        ],
                        'Contact' => [
                            'Telephone' => [$tenant->phone ?? ''],
                            'ElectronicMail' => [$tenant->email ?? ''],
                        ],
                    ],
                ],
                
                // Customer
                'AccountingCustomerParty' => [
                    'Party' => [
                        'PartyIdentification' => [
                            ['ID' => [$invoice->customer->tin ?? ''], '_attributes' => ['schemeID' => 'TIN']],
                            ['ID' => [$invoice->customer->id_number ?? ''], '_attributes' => ['schemeID' => $invoice->customer->id_type ?? 'NRIC']],
                        ],
                        'PostalAddress' => [
                            'AddressLine' => [
                                ['Line' => [$invoice->customer->address_line_1 ?? '']],
                                ['Line' => [$invoice->customer->address_line_2 ?? '']],
                                ['Line' => [$invoice->customer->address_line_3 ?? '']],
                            ],
                            'CityName' => [$invoice->customer->city ?? ''],
                            'PostalZone' => [$invoice->customer->postcode ?? ''],
                            'CountrySubentityCode' => [$invoice->customer->state ?? ''],
                            'Country' => [['IdentificationCode' => [$invoice->customer->country ?? 'MYS']]],
                        ],
                        'PartyLegalEntity' => [
                            ['RegistrationName' => [$invoice->customer->name]],
                        ],
                        'Contact' => [
                            'Telephone' => [$invoice->customer->contact_number ?? ''],
                            'ElectronicMail' => [$invoice->customer->email ?? ''],
                        ],
                    ],
                ],
                
                // Line Items
                'InvoiceLine' => $invoice->items->map(function ($item, $index) {
                    return [
                        'ID' => [$index + 1],
                        'InvoicedQuantity' => [$item->quantity],
                        'LineExtensionAmount' => [$item->total],
                        'Item' => [
                            'Description' => [$item->description],
                            'CommodityClassification' => [
                                ['ItemClassificationCode' => ['001']], // Classification code
                            ],
                        ],
                        'Price' => [
                            'PriceAmount' => [$item->unit_price],
                        ],
                    ];
                })->toArray(),
                
                // Totals
                'LegalMonetaryTotal' => [
                    'LineExtensionAmount' => [$invoice->subtotal],
                    'TaxExclusiveAmount' => [$invoice->subtotal],
                    'TaxInclusiveAmount' => [$invoice->total],
                    'PayableAmount' => [$invoice->total],
                ],
                
                // Tax Total
                'TaxTotal' => [
                    'TaxAmount' => [$invoice->tax_amount],
                    'TaxSubtotal' => [
                        [
                            'TaxableAmount' => [$invoice->subtotal],
                            'TaxAmount' => [$invoice->tax_amount],
                            'TaxCategory' => [
                                'ID' => ['01'], // 01 = Standard Rate
                                'TaxScheme' => [
                                    'ID' => ['OTH'], // OTH = SST
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
    
    /**
     * Validate e-Invoice data
     */
    protected function validate(array $data): array
    {
        $errors = [];
        
        // Basic validation
        if (empty($data['Invoice']['ID'])) {
            $errors[] = 'Invoice ID is required';
        }
        
        // Supplier validation
        $supplier = $data['Invoice']['AccountingSupplierParty']['Party'] ?? [];
        if (empty($supplier['PartyIdentification'])) {
            $errors[] = 'Supplier TIN is required';
        }
        
        // Customer validation
        $customer = $data['Invoice']['AccountingCustomerParty']['Party'] ?? [];
        if (empty($customer['PartyIdentification'])) {
            $errors[] = 'Customer identification is required';
        }
        
        return $errors;
    }
    
    /**
     * Generate QR code for e-Invoice
     */
    protected function generateQRCode(EInvoiceDocument $document): string
    {
        $qrData = [
            'uuid' => $document->uuid ?? '',
            'invoice' => $document->invoice->reference_number,
            'date' => $document->invoice->date->format('Y-m-d'),
            'amount' => $document->invoice->total,
        ];
        
        return QrCode::size(200)->generate(json_encode($qrData));
        // return 'mock_qr_code_data';
    }
    
    /**
     * Check if tenant is configured for e-Invoice
     */
    public function isConfigured(Tenant $tenant): bool
    {
        return $tenant->einvoice_enabled 
            && !empty($tenant->tin)
            && !empty($tenant->brn);
    }
}
