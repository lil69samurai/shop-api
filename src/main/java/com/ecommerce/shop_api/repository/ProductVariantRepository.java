package com.ecommerce.shop_api.repository;

import com.ecommerce.shop_api.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductIdOrderBySortOrderAsc(Long productId);

    // SKU 在同一商品內唯一
    Optional<ProductVariant> findByProductIdAndSku(Long productId, String sku);
    boolean existsByProductIdAndSku(Long productId, String sku);

    void deleteByProductId(Long productId);
}
