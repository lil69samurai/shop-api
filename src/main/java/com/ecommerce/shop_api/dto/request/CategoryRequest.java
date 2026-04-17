package com.ecommerce.shop_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Category can not be empty.")
    private String name;

    private String description;
}
