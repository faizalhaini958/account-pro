<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Models\Tenant;
use App\Models\JournalEntry;
use App\Services\PostingService;
use App\Services\Posting\GLAccountResolver;
use App\Services\Posting\Contracts\PostingRuleInterface;
use App\Services\TenantContext;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class PostingServiceTest extends TestCase
{
    use RefreshDatabase;

    private PostingService $postingService;
    private Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->tenant = Tenant::factory()->create();
        TenantContext::setTenant($this->tenant);

        // Mock GLAccountResolver since we don't testing resolution logic here, just posting
        $resolver = Mockery::mock(GLAccountResolver::class);
        $this->postingService = new PostingService($resolver);
    }

    public function test_post_creates_balanced_journal_entry()
    {
        // Seed COAs
        \App\Models\ChartOfAccount::create(['id' => 1, 'tenant_id' => $this->tenant->id, 'code' => '1000', 'name' => 'Asset', 'type' => 'asset']);
        \App\Models\ChartOfAccount::create(['id' => 2, 'tenant_id' => $this->tenant->id, 'code' => '2000', 'name' => 'Liability', 'type' => 'liability']);

        // Use an anonymous class extending Model
        $transaction = new class extends Model {
            protected $guarded = [];
            public $exists = true;
            public function getKey() { return 1; }
            public function getMorphClass() { return 'App\Models\TestTransaction'; }
        };
        $transaction->id = 1;
        $transaction->date = now();

        // Create a mock PostingRule
        $rule = Mockery::mock(PostingRuleInterface::class);
        $rule->shouldReceive('getJournalLines')->andReturn([
            [
                'account_id' => 1,
                'description' => 'Debit Line',
                'debit' => 100.00,
                'credit' => 0.00,
            ],
            [
                'account_id' => 2,
                'description' => 'Credit Line',
                'debit' => 0.00,
                'credit' => 100.00,
            ]
        ]);
        $rule->shouldReceive('getDescription')->andReturn('Test Transaction');
        $rule->shouldReceive('getReference')->andReturn('REF-001');

        $entry = $this->postingService->post($transaction, $rule);

        $this->assertDatabaseHas('journal_entries', [
            'tenant_id' => $this->tenant->id,
            'description' => 'Test Transaction',
            'reference_number' => 'REF-001',
            'status' => 'posted',
        ]);

        $this->assertCount(2, $entry->lines);
        $this->assertEquals(100.00, $entry->lines->where('type', 'debit')->sum('amount'));
        $this->assertEquals(100.00, $entry->lines->where('type', 'credit')->sum('amount'));
    }

    public function test_post_throws_exception_for_unbalanced_entry()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Journal entry is not balanced');

        $transaction = new class extends Model {
            protected $guarded = [];
            public $exists = true;
            public function getKey() { return 1; }
        };
        $transaction->id = 1;
        $transaction->date = now();

        $rule = Mockery::mock(PostingRuleInterface::class);
        $rule->shouldReceive('getJournalLines')->andReturn([
            [
                'account_id' => 1,
                'debit' => 100.00,
                'credit' => 0.00,
            ],
            [
                'account_id' => 2,
                'debit' => 0.00,
                'credit' => 90.00, // Unbalanced
            ]
        ]);

        $this->postingService->post($transaction, $rule);
    }

    public function test_reverse_creates_reversal_entry()
    {
        // Seed COAs
        \App\Models\ChartOfAccount::create(['id' => 1, 'tenant_id' => $this->tenant->id, 'code' => '1000', 'name' => 'Asset', 'type' => 'asset']);
        \App\Models\ChartOfAccount::create(['id' => 2, 'tenant_id' => $this->tenant->id, 'code' => '2000', 'name' => 'Liability', 'type' => 'liability']);

        // Manually create a posted entry
        $entry = JournalEntry::factory()->create([
            'tenant_id' => $this->tenant->id,
            'status' => 'posted',
            'number' => 'JE-00001',
            'description' => 'Original Entry',
        ]);
        
        \App\Models\JournalLine::create([
            'journal_entry_id' => $entry->id,
            'account_id' => 1,
            'type' => 'debit',
            'amount' => 100,
            'description' => 'Line 1'
        ]);
        
        \App\Models\JournalLine::create([
            'journal_entry_id' => $entry->id,
            'account_id' => 2,
            'type' => 'credit',
            'amount' => 100,
             'description' => 'Line 2'
        ]);

        $reversal = $this->postingService->reverse($entry, 'Voiding');

        // Check original is unposted/voided
        $this->assertDatabaseHas('journal_entries', [
            'id' => $entry->id,
            'status' => 'void',
        ]);

        // Check reversal entry
        $this->assertDatabaseHas('journal_entries', [
            'id' => $reversal->id,
            'status' => 'posted',
            'reference_number' => 'REV-JE-00001',
            'description' => 'Voiding - Original Entry',
        ]);

        // Check lines are swapped
        // Assuming reversal swaps types: Debit (Account 1) -> Credit (Account 1)
        $reversalLine1 = $reversal->lines->firstWhere('account_id', 1);
        $this->assertEquals('credit', $reversalLine1->type); 
        $this->assertEquals(100, $reversalLine1->amount);
        
        $reversalLine2 = $reversal->lines->firstWhere('account_id', 2);
        $this->assertEquals('debit', $reversalLine2->type);
        $this->assertEquals(100, $reversalLine2->amount);
    }
}
