package com.ecommerce.shop_api.repository;

import com.ecommerce.shop_api.entity.Order;
import com.ecommerce.shop_api.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Find all orders by user | ユーザーの全注文を検索する
    Page<Order> findByUserId(Long userId, Pageable pageable);

    // Find orders by user and status | ユーザーとステータスで注文を検索する
    Page<Order> findByUserIdAndStatus(Long userId, OrderStatus status, Pageable pageable);
}