package com.ecommerce.shop_api.repository;

import com.ecommerce.shop_api.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}