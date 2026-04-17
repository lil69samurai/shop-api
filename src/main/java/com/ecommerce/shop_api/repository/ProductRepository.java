package com.ecommerce.shop_api.repository;

import com.ecommerce.shop_api.entity.Product;
import com.ecommerce.shop_api.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
}