package com.ecommerce.shop_api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {
    private String imageUrl;

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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
}
