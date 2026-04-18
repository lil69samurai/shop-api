package com.ecommerce.shop_api.service;

import com.ecommerce.shop_api.dto.request.OrderItemRequest;
import com.ecommerce.shop_api.dto.request.OrderRequest;
import com.ecommerce.shop_api.dto.response.OrderItemResponse;
import com.ecommerce.shop_api.dto.response.OrderResponse;
import com.ecommerce.shop_api.entity.Order;
import com.ecommerce.shop_api.entity.OrderItem;
import com.ecommerce.shop_api.entity.Product;
import com.ecommerce.shop_api.entity.User;
import com.ecommerce.shop_api.enums.OrderStatus;
import com.ecommerce.shop_api.exception.ResourceNotFoundException;
import com.ecommerce.shop_api.repository.OrderRepository;
import com.ecommerce.shop_api.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    // =====================================================
    // Create Order | 注文を作成する
    // This is the most critical method - stock check + deduct
    // これが最も重要なメソッドです - 在庫確認と在庫減算
    // =====================================================
    @Transactional
    public OrderResponse createOrder(OrderRequest request, User currentUser) {

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Step 1: Loop through each item in the request | リクエストの各商品をループする
        for (OrderItemRequest itemRequest : request.getItems()) {

            // Step 2: Find the product | 商品を検索する
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found | 商品が見つかりません: ID " + itemRequest.getProductId()
                    ));

            // Step 3: Check if stock is sufficient | 在庫が十分かどうか確認する
            // This is the KEY business logic! | これが重要なビジネスロジックです！
            if (product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for product | 商品の在庫が不足しています: " + product.getName() +
                                " (Available | 在庫数: " + product.getStock() +
                                ", Requested | 注文数: " + itemRequest.getQuantity() + ")"
                );
            }

            // Step 4: Deduct stock | 在庫を減らす
            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);

            // Step 5: Calculate subtotal | 小計を計算する
            BigDecimal subtotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            // Step 6: Build order item | 注文明細を作成する
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .priceAtPurchase(product.getPrice()) // Save price at this moment | この時点の価格を保存する
                    .build();

            orderItems.add(orderItem);
        }

        // Step 7: Build and save the order | 注文を作成して保存する
        Order order = Order.builder()
                .user(currentUser)
                .status(OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .build();

        // Step 8: Link items to order | 明細を注文に紐付ける
        for (OrderItem item : orderItems) {
            item.setOrder(order);
            order.getItems().add(item);
        }

        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    // Get all orders for current user | 現在のユーザーの全注文を取得する
    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(User currentUser, Pageable pageable) {
        return orderRepository.findByUserId(currentUser.getId(), pageable)
                .map(this::mapToResponse);
    }

    // Get single order by ID | IDで注文を取得する
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id, User currentUser) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found | 注文が見つかりません: ID " + id
                ));

        // Security check: make sure the order belongs to current user
        // セキュリティチェック：注文が現在のユーザーのものであることを確認する
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException(
                    "Order not found | 注文が見つかりません: ID " + id
            );
        }

        return mapToResponse(order);
    }

    // Update order status (Admin only) | 注文ステータスを更新する（管理者のみ）
    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found | 注文が見つかりません: ID " + id
                ));

        // Update status | ステータスを更新する
        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        return mapToResponse(updated);
    }

    // =====================================================
    // Helper: Map Entity to Response DTO
    // エンティティをレスポンスDTOに変換する
    // =====================================================
    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .priceAtPurchase(item.getPriceAtPurchase())
                        .subtotal(item.getPriceAtPurchase()
                                .multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

}
