package com.ecommerce.shop_api.repository;

import com.ecommerce.shop_api.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductIdOrderBySortOrderAsc(Long productId);
    Optional<ProductVariant> findBySku(String sku);
    boolean existsBySku(String sku);
    void deleteByProductId(Long productId);
}
