-- ============================================
-- 商品規格 (SKU / Variant) 系統
-- 設計理念：屬性式（尺寸 × 顏色矩陣）
-- 支援多語系（ja/zh/en）
-- ============================================

-- 屬性定義表（每個商品自己的屬性，例：竹刀有「長さ」「重さ」）
CREATE TABLE product_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    name_ja VARCHAR(50) NOT NULL,
    name_zh VARCHAR(50),
    name_en VARCHAR(50),
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uk_product_option (product_id, name_ja)
);

-- 屬性值表（每個屬性的可選值，例：サイズ → [38, 39, 豆]）
CREATE TABLE product_option_values (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    option_id BIGINT NOT NULL,
    value_ja VARCHAR(100) NOT NULL,
    value_zh VARCHAR(100),
    value_en VARCHAR(100),
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (option_id) REFERENCES product_options(id) ON DELETE CASCADE,
    UNIQUE KEY uk_option_value (option_id, value_ja)
);

-- SKU 規格表（屬性的組合，每個組合就是一個販售單位）
CREATE TABLE product_variants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Variant 與屬性值的多對多關聯
CREATE TABLE variant_option_value_map (
    variant_id BIGINT NOT NULL,
    option_value_id BIGINT NOT NULL,
    PRIMARY KEY (variant_id, option_value_id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    FOREIGN KEY (option_value_id) REFERENCES product_option_values(id) ON DELETE CASCADE
);

-- ============================================
-- 為現有商品自動建立預設 Variant（資料遷移）
-- 規則：每個既有 product 自動建一個預設 variant
--       sku = "PROD-{id}-DEFAULT"，繼承 price 和 stock
-- ============================================
INSERT INTO product_variants (product_id, sku, price, stock, is_default, status, sort_order)
SELECT
    id,
    CONCAT('PROD-', id, '-DEFAULT'),
    price,
    stock,
    TRUE,
    'ACTIVE',
    0
FROM products;
