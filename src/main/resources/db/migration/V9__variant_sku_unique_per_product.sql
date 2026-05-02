-- ============================================
-- ProductVariant SKU unique 範圍調整
-- 變更前：sku 全站唯一
-- 變更後：(product_id, sku) 唯一（同商品內唯一）
-- ============================================

-- 移除舊的 UNIQUE index（V7 中以 inline UNIQUE 建立，預設 index 名稱為 sku）
ALTER TABLE product_variants DROP INDEX sku;

-- 加上新的複合 UNIQUE constraint
ALTER TABLE product_variants
    ADD CONSTRAINT uk_variant_product_sku UNIQUE (product_id, sku);
