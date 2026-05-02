package com.ecommerce.shop_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Category can not be empty.")
    private String name;

    // 可空，後端會自動生成
    private String code;

    private String description;
}
