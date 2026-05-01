package com.ecommerce.shop_api.repository;

import com.ecommerce.shop_api.entity.ProductOptionValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductOptionValueRepository extends JpaRepository<ProductOptionValue, Long> {
    List<ProductOptionValue> findByOptionIdOrderBySortOrderAsc(Long optionId);
}
