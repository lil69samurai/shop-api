package com.ecommerce.shop_api.repository;

import com.ecommerce.shop_api.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long>  {
    boolean existsByName(String name);
}
