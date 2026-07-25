<?php
// One-off (2026-07-25): set MacBook Pro 14" M5 Pro — Space Black / 15 CPU 16 GPU / 24GB / 1TB (MGDR4) price = 207000.
// Recomputes the product "from" price/price_max from non-zero variation prices.
// Run on prod: php artisan tinker scripts/seed_macbook_pro14_price_20260725.php

use App\Models\Product;

$p = Product::find(250); // MacBook Pro M5 Pro (14"), slug macbook-pro-14-m5-pro
if (!$p) { echo "product 250 not found\n"; return; }

$dump = function ($vars) {
    foreach ($vars as $v) {
        $a = $v['attributes'] ?? [];
        echo sprintf("  %-14s | %-6s | %-16s | %s\n",
            $a['Цвет'] ?? '?', $a['SSD'] ?? '?', $a['Процессор'] ?? '?', $v['price'] ?? '?');
    }
};

$vars = $p->variations;
echo "BEFORE (price={$p->price}, price_max={$p->price_max}):\n";
$dump($vars);

$changed = 0;
foreach ($vars as $i => $v) {
    $a = $v['attributes'] ?? [];
    if (($a['Цвет'] ?? '') === 'Серый космос'
        && ($a['SSD'] ?? '') === '1 ТБ'
        && ($a['Процессор'] ?? '') === '15 CPU / 16 GPU') {
        $vars[$i]['price'] = 207000;
        $vars[$i]['regular_price'] = 207000;
        $changed++;
    }
}
$p->variations = $vars;

// Recompute the card "from" range from non-zero variation prices.
$nonzero = array_filter(array_map(fn ($v) => (float) ($v['price'] ?? 0), $vars), fn ($x) => $x > 0);
$p->price = $nonzero ? min($nonzero) : 0;
$p->price_max = $nonzero ? max($nonzero) : null;
$p->save();

echo "\nchanged={$changed}  new price={$p->price}  price_max={$p->price_max}\n";
echo "AFTER:\n";
$dump($p->variations);
echo "DONE\n";
