package com.ecommerce.shop_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {

    @NotEmpty(message = "Order must contain at least one item | 注文には少なくとも1つの商品が必要です")
    private List<OrderItemRequest> items;

    @NotBlank(message = "Recipient name is required | 受取人名は必須です")
    private String recipientName;

    @NotBlank(message = "Phone is required | 電話番号は必須です")
    private String phone;

    @NotBlank(message = "Zip code is required | 郵便番号は必須です")
    private String zipCode;

    @NotBlank(message = "Address is required | 住所は必須です")
    private String address;

    @NotBlank(message = "Payment method is required | お支払い方法は必須です")
    private String paymentMethod;

    private String note;
}
