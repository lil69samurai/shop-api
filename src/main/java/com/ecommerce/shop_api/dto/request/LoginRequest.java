package com.ecommerce.shop_api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Username cannot be blank | ユーザー名は必須です")
    private String username;

    @NotBlank(message = "Password cannot be blank | パスワードは必須です")
    private String password;

}
