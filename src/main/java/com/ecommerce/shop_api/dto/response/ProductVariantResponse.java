package com.ecommerce.shop_api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProductVariantResponse {
    private Long id;
    private Long productId;
    private String sku;
    private BigDecimal price;
    private Integer stock;
    private Boolean isDefault;
    private String status;
    private Integer sortOrder;

    // 規格組合的屬性值（例：[{optionName: "サイズ", value: "39"}, {optionName: "色", value: "赤"}]）
    private List<VariantOptionValuePair> optionValues;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class VariantOptionValuePair {
        private Long optionId;
        private String optionNameJa;
        private String optionNameZh;
        private String optionNameEn;
        private Long valueId;
        private String valueJa;
        private String valueZh;
        private String valueEn;
    }
}
