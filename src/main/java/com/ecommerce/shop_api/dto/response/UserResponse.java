package com.ecommerce.shop_api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String role;

    // 預設收件資訊（用於結帳預填）
    private String defaultRecipientName;
    private String defaultPhone;
    private String defaultZipCode;
    private String defaultAddress;
    private String defaultNote;
}
