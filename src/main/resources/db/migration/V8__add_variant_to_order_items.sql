-- ============================================
-- Order Items 支援 SKU / Variant
-- 設計：欄位都允許 NULL，舊資料不受影響
-- ============================================

ALTER TABLE order_items
    ADD COLUMN product_variant_id BIGINT NULL,
    ADD COLUMN sku VARCHAR(100) NULL,
    ADD COLUMN variant_name VARCHAR(255) NULL;

ALTER TABLE order_items
    ADD CONSTRAINT fk_order_items_product_variant
    FOREIGN KEY (product_variant_id) REFERENCES product_variants(id);
