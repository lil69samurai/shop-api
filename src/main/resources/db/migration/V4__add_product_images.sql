-- 新增商品多圖片支援表
CREATE TABLE product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 將現有商品的 image_url 搬移到 product_images 表中（保留舊資料）
INSERT INTO product_images (product_id, image_url, sort_order)
SELECT id, image_url, 0
FROM products
WHERE image_url IS NOT NULL AND image_url != '';
