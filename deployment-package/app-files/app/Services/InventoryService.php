<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;
use App\Services\TenantContext;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * Record stock in (purchase)
     * 
     * @param Product $product
     * @param float $quantity
     * @param float $unitCost
     * @param string $reference
     * @param string $type
     * @return StockMovement
     */
    public function stockIn(Product $product, float $quantity, float $unitCost, string $reference, string $type = 'purchase'): StockMovement
    {
        return DB::transaction(function () use ($product, $quantity, $unitCost, $reference, $type) {
            // Create stock movement record
            $movement = StockMovement::create([
                'product_id' => $product->id,
                'type' => $type,
                'quantity' => $quantity,
                'unit_cost' => $unitCost,
                'total_cost' => $quantity * $unitCost,
                'reference' => $reference,
                'date' => now(),
                'balance_quantity' => $quantity, // For FIFO tracking
            ]);

            // Update product stock
            $product->increment('current_stock', $quantity);

            // Recalculate average cost
            $this->updateAverageCost($product);

            return $movement;
        });
    }

    /**
     * Record stock out (sale)
     * 
     * @param Product $product
     * @param float $quantity
     * @param string $reference
     * @param string $type
     * @return array ['movement' => StockMovement, 'cogs' => float]
     */
    public function stockOut(Product $product, float $quantity, string $reference, string $type = 'sale'): array
    {
        return DB::transaction(function () use ($product, $quantity, $reference, $type) {
            // Calculate COGS using FIFO
            $cogs = $this->calculateFIFOCost($product, $quantity);

            // Create stock movement record
            $movement = StockMovement::create([
                'product_id' => $product->id,
                'type' => $type,
                'quantity' => -$quantity, // Negative for stock out
                'unit_cost' => $cogs / $quantity, // Average cost of items sold
                'total_cost' => -$cogs, // Negative for stock out
                'reference' => $reference,
                'date' => now(),
            ]);

            // Update product stock
            $product->decrement('current_stock', $quantity);

            // Recalculate average cost
            $this->updateAverageCost($product);

            return [
                'movement' => $movement,
                'cogs' => $cogs,
            ];
        });
    }

    /**
     * Calculate COGS using FIFO method
     * 
     * @param Product $product
     * @param float $quantity
     * @return float Total cost of goods sold
     */
    protected function calculateFIFOCost(Product $product, float $quantity): float
    {
        $remainingQty = $quantity;
        $totalCost = 0;

        // Get stock in movements with remaining balance, ordered by date (FIFO)
        $stockLayers = StockMovement::where('product_id', $product->id)
            ->whereIn('type', ['purchase', 'adjustment_in', 'opening_balance'])
            ->where('balance_quantity', '>', 0)
            ->orderBy('date')
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

        foreach ($stockLayers as $layer) {
            if ($remainingQty <= 0) {
                break;
            }

            $qtyFromThisLayer = min($remainingQty, $layer->balance_quantity);
            $costFromThisLayer = $qtyFromThisLayer * $layer->unit_cost;

            $totalCost += $costFromThisLayer;
            $remainingQty -= $qtyFromThisLayer;

            // Update balance quantity in this layer
            $layer->decrement('balance_quantity', $qtyFromThisLayer);
        }

        // If we still have remaining quantity, use the product's purchase cost as fallback
        if ($remainingQty > 0) {
            $totalCost += $remainingQty * ($product->purchase_cost ?? 0);
        }

        return $totalCost;
    }

    /**
     * Update product's average cost
     * 
     * @param Product $product
     * @return void
     */
    protected function updateAverageCost(Product $product): void
    {
        // Get all stock layers with remaining balance
        $stockLayers = StockMovement::where('product_id', $product->id)
            ->whereIn('type', ['purchase', 'adjustment_in', 'opening_balance'])
            ->where('balance_quantity', '>', 0)
            ->get();

        $totalQuantity = $stockLayers->sum('balance_quantity');
        $totalValue = $stockLayers->sum(function ($layer) {
            return $layer->balance_quantity * $layer->unit_cost;
        });

        if ($totalQuantity > 0) {
            $averageCost = $totalValue / $totalQuantity;
            $product->update(['purchase_cost' => $averageCost]);
        }
    }

    /**
     * Adjust stock (for corrections)
     * 
     * @param Product $product
     * @param float $quantity Positive for increase, negative for decrease
     * @param float $unitCost
     * @param string $reason
     * @return StockMovement
     */
    public function adjustStock(Product $product, float $quantity, float $unitCost, string $reason): StockMovement
    {
        $type = $quantity > 0 ? 'adjustment_in' : 'adjustment_out';
        
        if ($quantity > 0) {
            return $this->stockIn($product, $quantity, $unitCost, $reason, $type);
        } else {
            $result = $this->stockOut($product, abs($quantity), $reason, $type);
            return $result['movement'];
        }
    }

    /**
     * Get current inventory valuation for a product
     * 
     * @param Product $product
     * @return array ['quantity' => float, 'value' => float, 'average_cost' => float]
     */
    public function getValuation(Product $product): array
    {
        $stockLayers = StockMovement::where('product_id', $product->id)
            ->whereIn('type', ['purchase', 'adjustment_in', 'opening_balance'])
            ->where('balance_quantity', '>', 0)
            ->get();

        $totalQuantity = $stockLayers->sum('balance_quantity');
        $totalValue = $stockLayers->sum(function ($layer) {
            return $layer->balance_quantity * $layer->unit_cost;
        });

        return [
            'quantity' => $totalQuantity,
            'value' => $totalValue,
            'average_cost' => $totalQuantity > 0 ? $totalValue / $totalQuantity : 0,
        ];
    }

    /**
     * Get total inventory valuation for all products
     * 
     * @return array ['total_quantity' => int, 'total_value' => float, 'products' => array]
     */
    public function getTotalValuation(): array
    {
        $tenant = TenantContext::getTenant();
        
        $products = Product::where('track_inventory', true)
            ->where('current_stock', '>', 0)
            ->get();

        $totalValue = 0;
        $totalQuantity = 0;
        $productDetails = [];

        foreach ($products as $product) {
            $valuation = $this->getValuation($product);
            
            $totalValue += $valuation['value'];
            $totalQuantity += $valuation['quantity'];
            
            $productDetails[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'sku' => $product->sku,
                'quantity' => $valuation['quantity'],
                'average_cost' => $valuation['average_cost'],
                'total_value' => $valuation['value'],
            ];
        }

        return [
            'total_quantity' => $totalQuantity,
            'total_value' => $totalValue,
            'products' => $productDetails,
        ];
    }

    /**
     * Get stock movement history for a product
     * 
     * @param Product $product
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getMovementHistory(Product $product, int $limit = 50)
    {
        return StockMovement::where('product_id', $product->id)
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Check if product has sufficient stock
     * 
     * @param Product $product
     * @param float $quantity
     * @return bool
     */
    public function hasSufficientStock(Product $product, float $quantity): bool
    {
        return $product->current_stock >= $quantity;
    }

    /**
     * Get low stock products
     * 
     * @param int $threshold
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getLowStockProducts(int $threshold = 10)
    {
        return Product::where('track_inventory', true)
            ->where('current_stock', '<=', $threshold)
            ->where('current_stock', '>', 0)
            ->orderBy('current_stock')
            ->get();
    }
}
