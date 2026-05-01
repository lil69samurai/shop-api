package com.ecommerce.shop_api.repository;

import com.ecommerce.shop_api.entity.ProductOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductOptionRepository extends JpaRepository<ProductOption, Long> {
    List<ProductOption> findByProductIdOrderBySortOrderAsc(Long productId);
    void deleteByProductId(Long productId);
}
