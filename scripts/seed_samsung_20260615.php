<?php
// One-off: replace Samsung S25/S25 Ultra/S26 Ultra and add S25 FE/S26/S26+
// per Alex's SKU list (2026-06-15). Prices left at 0 → «Цена по запросу».
// Run: php artisan tinker scripts/seed_samsung_20260615.php  (backup already saved)

use App\Models\Product;
use Illuminate\Support\Facades\DB;

$ATTR_COLOR = 1;   // Цвет
$ATTR_MEMORY = 2;  // Память

// Models. Either ['storages'+'colors'] (full cartesian) or explicit ['combos'] = [[memory,color],...]
$models = [
    [
        'name' => 'Samsung Galaxy S25', 'slug' => 'samsung-galaxy-s25',
        'sku' => 'SM-S931B', 'category_id' => 61, 'ram' => '12 ГБ',
        'storages' => ['128 ГБ', '256 ГБ'],
        'colors' => ['Icyblue', 'Mint', 'Silver Shadow'],
    ],
    [
        'name' => 'Samsung Galaxy S25 FE', 'slug' => 'samsung-galaxy-s25-fe',
        'sku' => 'SM-S731B', 'category_id' => 61, 'ram' => '8 ГБ',
        'storages' => ['128 ГБ', '256 ГБ'],
        'colors' => ['JetBlack', 'Navy', 'White'],
    ],
    [
        'name' => 'Samsung Galaxy S25 Ultra', 'slug' => 'samsung-galaxy-s25-ultra',
        'sku' => 'SM-S938B', 'category_id' => 61, 'ram' => '12 ГБ',
        'combos' => [
            ['512 ГБ', 'Titanium Black'], ['512 ГБ', 'Titanium Gray'], ['512 ГБ', 'Titanium Whitesilver'],
            ['1 ТБ', 'Titanium Black'], ['1 ТБ', 'Titanium Gray'], ['1 ТБ', 'Titanium SilverBlue'], ['1 ТБ', 'Titanium Whitesilver'],
        ],
    ],
    [
        'name' => 'Samsung Galaxy S26', 'slug' => 'samsung-galaxy-s26',
        'sku' => 'SM-S942B', 'category_id' => 62, 'ram' => '12 ГБ',
        'storages' => ['256 ГБ'],
        'colors' => ['Cobalt Violet', 'Sky Blue', 'Голубой', 'Фиолетовый'],
    ],
    [
        'name' => 'Samsung Galaxy S26+', 'slug' => 'samsung-galaxy-s26-plus',
        'sku' => 'SM-S947B', 'category_id' => 62, 'ram' => '12 ГБ',
        'combos' => [
            ['256 ГБ', 'Black'], ['256 ГБ', 'Sky Blue'], ['256 ГБ', 'Белый'], ['256 ГБ', 'Голубой'],
            ['512 ГБ', 'White'],
        ],
    ],
    [
        'name' => 'Samsung Galaxy S26 Ultra', 'slug' => 'samsung-galaxy-s26-ultra',
        'sku' => 'SM-S948B', 'category_id' => 62, 'ram' => '12 ГБ',
        'combos' => [
            ['256 ГБ', 'Cobalt Violet'], ['256 ГБ', 'Sky Blue'],
            ['512 ГБ', 'Black'], ['512 ГБ', 'Cobalt Violet'], ['512 ГБ', 'Sky Blue'],
        ],
    ],
];

$vid = 90000;

DB::transaction(function () use ($models, $ATTR_COLOR, $ATTR_MEMORY, &$vid) {
    // 1) Remove the old overlapping products (S26 Ultra 390, S25 395, S25 Ultra 398)
    foreach ([390, 395, 398] as $oldId) {
        $old = Product::find($oldId);
        if ($old) {
            $old->attributes()->detach();
            $old->delete();
            echo "deleted old product $oldId\n";
        }
    }

    // 2) Create / update each model
    foreach ($models as $m) {
        // Build combos
        $combos = [];
        if (isset($m['combos'])) {
            $combos = $m['combos'];
        } else {
            foreach ($m['storages'] as $st) {
                foreach ($m['colors'] as $col) {
                    $combos[] = [$st, $col];
                }
            }
        }

        // Distinct memory / color sets (preserve order of first appearance)
        $memories = [];
        $colors = [];
        $variations = [];
        foreach ($combos as [$mem, $col]) {
            if (!in_array($mem, $memories, true)) $memories[] = $mem;
            if (!in_array($col, $colors, true)) $colors[] = $col;
            $variations[] = [
                'id' => $vid++,
                'image' => '',
                'price' => 0,
                'in_stock' => true,
                'attributes' => ['Цвет' => $col, 'Память' => $mem],
                'is_preorder' => false,
                'availability' => '',
                'regular_price' => 0,
                'is_purchasable' => true,
            ];
        }

        $product = Product::updateOrCreate(
            ['slug' => $m['slug']],
            [
                'name' => $m['name'],
                'sku' => $m['sku'],
                'category_id' => $m['category_id'],
                'description' => "Оперативная память {$m['ram']}. Артикул {$m['sku']}.",
                'price' => 0,
                'price_max' => null,
                'image_main' => null,
                'images' => null,
                'specs' => null,
                'variations' => $variations,
                'in_stock' => true,
                'is_preorder' => false,
                'is_active' => true,
            ]
        );

        // Reset & attach pivot attribute values (idempotent on re-run)
        $product->attributes()->detach();
        foreach ($colors as $col) {
            $product->attributes()->attach($ATTR_COLOR, ['value' => $col]);
        }
        foreach ($memories as $mem) {
            $product->attributes()->attach($ATTR_MEMORY, ['value' => $mem]);
        }

        echo "upserted #{$product->id} {$m['name']} (cat {$m['category_id']}): "
            . count($variations) . " variations, "
            . count($colors) . " colors, " . count($memories) . " memories\n";
    }
});

echo "DONE\n";
