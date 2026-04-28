package com.ecommerce.shop_api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private Long userId;
    private String status;
    private String username;
    private BigDecimal totalAmount;
    private List<OrderItemResponse> items;

    // Shipping info
    private String recipientName;
    private String phone;
    private String zipCode;
    private String address;
    private String paymentMethod;
    private String note;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
