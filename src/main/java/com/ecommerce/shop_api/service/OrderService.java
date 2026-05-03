package com.ecommerce.shop_api.service;

import com.ecommerce.shop_api.dto.request.OrderAdminUpdateRequest;
import com.ecommerce.shop_api.dto.request.OrderItemRequest;
import com.ecommerce.shop_api.dto.request.OrderRequest;
import com.ecommerce.shop_api.dto.response.OrderItemResponse;
import com.ecommerce.shop_api.dto.response.OrderResponse;
import com.ecommerce.shop_api.entity.Order;
import com.ecommerce.shop_api.entity.OrderItem;
import com.ecommerce.shop_api.entity.Product;
import com.ecommerce.shop_api.entity.ProductOption;
import com.ecommerce.shop_api.entity.ProductOptionValue;
import com.ecommerce.shop_api.entity.ProductVariant;
import com.ecommerce.shop_api.entity.User;
import com.ecommerce.shop_api.enums.OrderStatus;
import com.ecommerce.shop_api.exception.ResourceNotFoundException;
import com.ecommerce.shop_api.repository.OrderRepository;
import com.ecommerce.shop_api.repository.ProductRepository;
import com.ecommerce.shop_api.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final EmailService emailService;

    // Allowed status transitions map
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = new HashMap<>();
    static {
        ALLOWED_TRANSITIONS.put(OrderStatus.PENDING,    Set.of(OrderStatus.PAID, OrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(OrderStatus.PAID,       Set.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(OrderStatus.SHIPPED,    Set.of(OrderStatus.DELIVERED));
        ALLOWED_TRANSITIONS.put(OrderStatus.DELIVERED,  Set.of(OrderStatus.COMPLETED));
        ALLOWED_TRANSITIONS.put(OrderStatus.COMPLETED,  Set.of()); // terminal state
        ALLOWED_TRANSITIONS.put(OrderStatus.CANCELLED,  Set.of()); // terminal state
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request, User currentUser) {
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found | 商品が見つかりません: ID " + itemRequest.getProductId()
                    ));

            ProductVariant variant = null;
            BigDecimal unitPrice;
            int currentStock;
            String sku = null;
            String variantName = null;

            if (itemRequest.getProductVariantId() != null) {
                variant = productVariantRepository.findById(itemRequest.getProductVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Variant not found | 規格が見つかりません: ID " + itemRequest.getProductVariantId()
                        ));

                if (!variant.getProduct().getId().equals(product.getId())) {
                    throw new RuntimeException(
                            "Variant does not belong to this product | 規格が商品と一致しません"
                    );
                }

                if (variant.getStatus() != null && !"ACTIVE".equalsIgnoreCase(variant.getStatus())) {
                    throw new RuntimeException(
                            "Variant is not available | この規格は販売停止中です: " + variant.getSku()
                    );
                }

                currentStock = variant.getStock() == null ? 0 : variant.getStock();
                if (currentStock < itemRequest.getQuantity()) {
                    throw new RuntimeException(
                            "Insufficient stock for variant | 規格の在庫が不足しています: " + variant.getSku() +
                                    " (Available | 在庫数: " + currentStock +
                                    ", Requested | 注文数: " + itemRequest.getQuantity() + ")"
                    );
                }

                variant.setStock(currentStock - itemRequest.getQuantity());
                productVariantRepository.save(variant);

                unitPrice = variant.getPrice();
                sku = variant.getSku();
                variantName = buildVariantName(variant);
            } else {
                currentStock = product.getStock() == null ? 0 : product.getStock();
                if (currentStock < itemRequest.getQuantity()) {
                    throw new RuntimeException(
                            "Insufficient stock for product | 商品の在庫が不足しています: " + product.getName() +
                                    " (Available | 在庫数: " + currentStock +
                                    ", Requested | 注文数: " + itemRequest.getQuantity() + ")"
                    );
                }

                product.setStock(currentStock - itemRequest.getQuantity());
                productRepository.save(product);

                unitPrice = product.getPrice();
            }

            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .productVariant(variant)
                    .sku(sku)
                    .variantName(variantName)
                    .quantity(itemRequest.getQuantity())
                    .priceAtPurchase(unitPrice)
                    .build();

            orderItems.add(orderItem);
        }

        Order order = Order.builder()
                .user(currentUser)
                .status(OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .recipientName(request.getRecipientName())
                .phone(request.getPhone())
                .zipCode(request.getZipCode())
                .address(request.getAddress())
                .paymentMethod(request.getPaymentMethod())
                .note(request.getNote())
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
            order.getItems().add(item);
        }

        Order saved = orderRepository.save(order);

        // Send order confirmation email (async, non-blocking)
        // 注文確認メール送信（非同期）
        emailService.sendOrderCreatedEmail(saved);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(User currentUser, Pageable pageable) {
        return orderRepository.findByUserId(currentUser.getId(), pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id, User currentUser) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found | 注文が見つかりません: ID " + id
                ));

        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(auth -> "ROLE_ADMIN".equals(auth.getAuthority()));

        if (!isAdmin && !order.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException(
                    "Order not found | 注文が見つかりません: ID " + id
            );
        }

        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdForAdmin(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found | 注文が見つかりません: ID " + id
                ));
        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse adminUpdateOrderInfo(Long id, OrderAdminUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found | 注文が見つかりません: ID " + id
                ));

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PAID) {
            throw new RuntimeException(
                    "Only PENDING or PAID orders can be edited | PENDING または PAID の注文のみ編集できます"
            );
        }

        order.setRecipientName(request.getRecipientName());
        order.setPhone(request.getPhone());
        order.setZipCode(request.getZipCode());
        order.setAddress(request.getAddress());
        order.setNote(request.getNote());

        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteOrder(Long id, User currentUser) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found: ID " + id
                ));

        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Order not found: ID " + id);
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException(
                    "Cannot cancel order. Only PENDING orders can be cancelled. Current status: " + order.getStatus()
            );
        }

        for (OrderItem item : order.getItems()) {
            restoreStock(item);
        }

        orderRepository.delete(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found | 注文が見つかりません: ID " + id
                ));

        OrderStatus currentStatus = order.getStatus();

        // Validate status transition
        Set<OrderStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new RuntimeException(
                    "Invalid status transition | 無効なステータス遷移: " + currentStatus + " → " + newStatus +
                    ". Allowed | 許可: " + allowed
            );
        }

        // If cancelling, restore stock
        if (newStatus == OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                restoreStock(item);
            }
        }

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);

        // Send status-change notification (async, non-blocking)
        // ステータス変更通知メール送信（非同期）
        if (newStatus == OrderStatus.SHIPPED) {
            emailService.sendOrderShippedEmail(updated);
        } else if (newStatus == OrderStatus.CANCELLED) {
            emailService.sendOrderCancelledEmail(updated);
        }

        return mapToResponse(updated);
    }

    // ============================================================
    // Helpers
    // ============================================================

    private void restoreStock(OrderItem item) {
        if (item.getProductVariant() != null) {
            ProductVariant variant = productVariantRepository.findById(item.getProductVariant().getId())
                    .orElse(null);
            if (variant != null) {
                int s = variant.getStock() == null ? 0 : variant.getStock();
                variant.setStock(s + item.getQuantity());
                productVariantRepository.save(variant);
                return;
            }
        }
        Product product = item.getProduct();
        int s = product.getStock() == null ? 0 : product.getStock();
        product.setStock(s + item.getQuantity());
        productRepository.save(product);
    }

    private String buildVariantName(ProductVariant variant) {
        if (variant.getOptionValues() == null || variant.getOptionValues().isEmpty()) {
            return null;
        }
        return variant.getOptionValues().stream()
                .map(v -> {
                    ProductOption opt = v.getOption();
                    String name = opt != null && opt.getNameJa() != null ? opt.getNameJa() : "";
                    String val = v.getValueJa() != null ? v.getValueJa() : "";
                    return name + ":" + val;
                })
                .collect(Collectors.joining(" / "));
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .productVariantId(item.getProductVariant() != null ? item.getProductVariant().getId() : null)
                        .sku(item.getSku())
                        .variantName(item.getVariantName())
                        .quantity(item.getQuantity())
                        .priceAtPurchase(item.getPriceAtPurchase())
                        .subtotal(item.getPriceAtPurchase()
                                .multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .username(order.getUser().getUsername())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .items(itemResponses)
                .recipientName(order.getRecipientName())
                .phone(order.getPhone())
                .zipCode(order.getZipCode())
                .address(order.getAddress())
                .paymentMethod(order.getPaymentMethod())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
