package com.ecommerce.shop_api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username cannot be blank | ユーザー名は必須です")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters | ユーザー名は3〜50文字である必要があります")
    private String username;

    @NotBlank(message = "Email cannot be blank | メールアドレスは必須です")
    @Email(message = "Invalid email format | 無効なメール形式です")
    private String email;

    @NotBlank(message = "Password cannot be blank | パスワードは必須です")
    @Size(min = 6, message = "Password must be at least 6 characters | パスワードは6文字以上である必要があります")
    private String password;
}
