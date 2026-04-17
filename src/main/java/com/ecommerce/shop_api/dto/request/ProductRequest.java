package com.ecommerce.shop_api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {

    @NotBlank(message = "Product's name can not be empty.")
    private String name;

    private String description;

    @NotNull(message = "Product's price can not be empty.")
    @Min(value = 0, message = "Product's price can not be zero.")
    private BigDecimal price;

    @NotNull(message = "Stock can not be empty.")
    @Min(value = 0, message = "Stock can not be zero.")
    private Integer stock;

    @NotNull(message = "Category ID can not be empty.")
    private Long categoryId;
}
