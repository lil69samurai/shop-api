package com.ecommerce.shop_api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderItemRequest {
    @NotNull(message = "Product ID cannot be null | 商品IDは必須です")
    private Long productId;

    @NotNull(message = "Quantity cannot be null | 数量は必須です")
    @Min(value = 1, message = "Quantity must be at least 1 | 数量は1以上である必要があります")
    private Integer quantity;
}