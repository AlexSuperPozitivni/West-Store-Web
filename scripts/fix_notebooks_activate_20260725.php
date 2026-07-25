<?php
// One-off (2026-07-25): the 53 laptops in the root «Ноутбуки» category (52) were all
// is_active=0 (bulk-deactivated 2026-04-10 20:17), so /catalog/notebook showed only the
// single active Samsung. Reactivate them and file each under its brand subcategory so the
// brand tabs (Lenovo/Acer/Asus/…) are populated. Unmatched brands stay in root 52 (still
// visible on the parent page). Fully reversible via the printed backup.
// Run on prod: php artisan tinker scripts/fix_notebooks_activate_20260725.php

use Illuminate\Support\Facades\DB;

$catByBrand = [
    'lenovo' => 39, 'acer' => 2, 'asus' => 10, 'vivobook' => 10,
    'dell' => 12, 'hp' => 18, 'huawei' => 19, 'lg' => 40, 'msi' => 51,
];

$rows = DB::table('products')->where('category_id', 52)->get(['id', 'name', 'category_id', 'is_active']);
echo "found " . count($rows) . " products in root category 52\n";
echo "--- BACKUP (id | old_category_id | is_active | name) ---\n";
foreach ($rows as $r) {
    echo "{$r->id}\t{$r->category_id}\t{$r->is_active}\t{$r->name}\n";
}

$moved = [];
$activated = 0;
foreach ($rows as $r) {
    $word = null;
    if (preg_match('/Ноутбук\s+([A-Za-z]+)/u', $r->name, $m)) {
        $word = strtolower($m[1]);
    }
    $newCat = $catByBrand[$word] ?? 52;

    $update = ['is_active' => 1];
    if ($newCat !== 52) {
        $update['category_id'] = $newCat;
    }
    DB::table('products')->where('id', $r->id)->update($update);
    $activated++;
    $moved[$newCat] = ($moved[$newCat] ?? 0) + 1;
}

echo "\nactivated={$activated}\n";
echo "--- new category distribution ---\n";
foreach ($moved as $cat => $cnt) {
    echo "cat {$cat}: {$cnt}\n";
}
echo "DONE\n";
