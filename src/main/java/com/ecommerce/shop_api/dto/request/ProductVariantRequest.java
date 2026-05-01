package com.ecommerce.shop_api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductVariantRequest {

    @NotBlank(message = "SKU can not be empty.")
    private String sku;

    @NotNull(message = "Price can not be empty.")
    @Min(value = 0, message = "Price can not be negative.")
    private BigDecimal price;

    @NotNull(message = "Stock can not be empty.")
    @Min(value = 0, message = "Stock can not be negative.")
    private Integer stock;

    private String status;
    private Integer sortOrder;

    // 此 variant 對應的屬性值 ID 列表（例：[サイズ:39 的 valueId, 色:赤 的 valueId]）
    private List<Long> optionValueIds;
}
