package com.ecommerce.shop_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderAdminUpdateRequest {

    @NotBlank(message = "Recipient name is required | 受取人名は必須です")
    private String recipientName;

    @NotBlank(message = "Phone is required | 電話番号は必須です")
    private String phone;

    @NotBlank(message = "Zip code is required | 郵便番号は必須です")
    private String zipCode;

    @NotBlank(message = "Address is required | 住所は必須です")
    private String address;

    private String note;
}
