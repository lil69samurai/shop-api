package com.ecommerce.shop_api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String productCode;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private java.util.List<String> imageUrls;
    private java.util.List<Long> imageIds;
    private String status;

    private Long categoryId;
    private String categoryName;

    // SKU / 規格系統
    private java.util.List<ProductOptionResponse> options;
    private java.util.List<ProductVariantResponse> variants;
    private Boolean hasVariants;  // 前端方便判斷：是否有自訂規格（非僅預設）

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}