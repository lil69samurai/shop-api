-- ============================================
-- V10: 加上分類 code、商品 productCode、屬性值 code
-- ============================================

-- 1) categories 加 code（2 字母大寫，UNIQUE）
ALTER TABLE categories
    ADD COLUMN code VARCHAR(8) NULL;

-- 為既有分類自動補 code：取 id 對應 AA / AB / AC...
UPDATE categories
SET code = CONCAT(
    CHAR(65 + FLOOR((id - 1) / 26)),
    CHAR(65 + MOD((id - 1), 26))
)
WHERE code IS NULL;

ALTER TABLE categories
    MODIFY COLUMN code VARCHAR(8) NOT NULL;

ALTER TABLE categories
    ADD CONSTRAINT uk_category_code UNIQUE (code);

-- 2) products 加 product_code（P001 流水號，UNIQUE）
ALTER TABLE products
    ADD COLUMN product_code VARCHAR(32) NULL;

-- 為既有商品自動補 product_code：P + 4 位 id
UPDATE products
SET product_code = CONCAT('P', LPAD(id, 4, '0'))
WHERE product_code IS NULL;

ALTER TABLE products
    MODIFY COLUMN product_code VARCHAR(32) NOT NULL;

ALTER TABLE products
    ADD CONSTRAINT uk_product_code UNIQUE (product_code);

-- 3) product_option_values 加 code（Admin 自填，相同 option 內 UNIQUE）
ALTER TABLE product_option_values
    ADD COLUMN code VARCHAR(32) NULL;
