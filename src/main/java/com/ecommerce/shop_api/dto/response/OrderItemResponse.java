package com.ecommerce.shop_api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private String productName;

    // SKU / 規格資訊（可為 null：表示無規格商品）
    private Long productVariantId;
    private String sku;
    private String variantName;

    private Integer quantity;
    private BigDecimal priceAtPurchase;
    private BigDecimal subtotal;
}
