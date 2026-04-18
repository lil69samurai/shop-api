package com.ecommerce.shop_api.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {

    @NotEmpty(message = "Order must contain at least one item | 注文には少なくとも1つの商品が必要です")
    private List<OrderItemRequest> items;
}