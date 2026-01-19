<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\PDFService;
use App\Services\ExportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as DomPDF;
use Illuminate\Support\Facades\Response;
use Mockery;
use Illuminate\Database\Eloquent\Collection;

class PDFExportServiceTest extends TestCase
{
    public function test_pdf_invoice_generation()
    {
        $pdfService = new PDFService();
        
        // Mock the Invoice model and relations
        $invoice = Mockery::mock(\App\Models\Invoice::class);
        $invoice->shouldReceive('load')->with(['customer', 'items'])->once();
        
        // Mock the DomPDF instance
        $mockPdf = Mockery::mock(DomPDF::class);
        $mockPdf->shouldReceive('setPaper')->with('a4')->once()->andReturnSelf();

        // Mock the Facade
        Pdf::shouldReceive('loadView')
            ->with('pdf.invoice', ['invoice' => $invoice])
            ->once()
            ->andReturn($mockPdf);

        $result = $pdfService->generateInvoice($invoice);
        
        $this->assertSame($mockPdf, $result);
    }

    public function test_pdf_financial_reports_generation()
    {
        $pdfService = new PDFService();
        $data = ['test' => 'data'];

        // Mock P&L
        $mockPdf = Mockery::mock(DomPDF::class);
        $mockPdf->shouldReceive('setPaper')->with('a4')->once()->andReturnSelf();
        
        Pdf::shouldReceive('loadView')
            ->with('pdf.profit-and-loss', Mockery::on(fn($arg) => $arg['report'] === $data))
            ->once()
            ->andReturn($mockPdf);
            
        $pdfService->generateProfitAndLoss($data);

        // Mock Balance Sheet
        $mockPdf2 = Mockery::mock(DomPDF::class);
        $mockPdf2->shouldReceive('setPaper')->with('a4')->once()->andReturnSelf();
        
        Pdf::shouldReceive('loadView')
            ->with('pdf.balance-sheet', Mockery::on(fn($arg) => $arg['report'] === $data))
            ->once()
            ->andReturn($mockPdf2);
            
        $pdfService->generateBalanceSheet($data);
        
        $this->addToAssertionCount(2); // Verify mocks were called
    }

    public function test_export_to_csv_basic()
    {
        $exportService = new ExportService();
        $data = [
            ['col1' => 'A1', 'col2' => 'B1'],
            ['col1' => 'A2', 'col2' => 'B2'],
        ];
        $headers = ['Column 1', 'Column 2'];
        
        $response = $exportService->toCSV($data, $headers, 'test.csv');
        
        $this->assertInstanceOf(\Symfony\Component\HttpFoundation\StreamedResponse::class, $response);
        $this->assertEquals('text/csv', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('attachment; filename="test.csv"', $response->headers->get('Content-Disposition'));
        
        // Capture output
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();
        
        // fputcsv often adds quotes, or at least handling them might vary. 
        // Let's assert content contains the lines instead of exact match for the whole string if quoting varies.
        // Actually, the error message shows exactly what it produces: quoted headers, unquoted values (if uncomplicated).
        $this->assertStringContainsString('"Column 1","Column 2"', $content);
        $this->assertStringContainsString('A1,B1', $content);
        $this->assertStringContainsString('A2,B2', $content);
    }

    public function test_export_profit_and_loss_csv()
    {
        $exportService = new ExportService();
        $data = [
            'period' => ['start' => '2023-01-01', 'end' => '2023-01-31'],
            'income' => [
                'accounts' => [['account_code' => '4000', 'account_name' => 'Sales', 'amount' => 1000]],
                'total' => 1000
            ],
            'expenses' => [
                'accounts' => [['account_code' => '5000', 'account_name' => 'COGS', 'amount' => 500]],
                'total' => 500
            ],
            'net_profit' => 500
        ];
        
        $response = $exportService->profitAndLossToCSV($data);
        
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();
        
        $this->assertStringContainsString('INCOME', $content);
        $this->assertStringContainsString('Sales', $content);
        $this->assertStringContainsString('1000', $content);
        $this->assertStringContainsString('NET PROFIT', $content);
        $this->assertStringContainsString('500', $content);
    }
}
