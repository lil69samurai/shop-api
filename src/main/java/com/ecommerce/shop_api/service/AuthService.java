package com.ecommerce.shop_api.service;

import com.ecommerce.shop_api.dto.request.LoginRequest;
import com.ecommerce.shop_api.dto.request.RegisterRequest;
import com.ecommerce.shop_api.dto.response.AuthResponse;
import com.ecommerce.shop_api.entity.User;
import com.ecommerce.shop_api.enums.Role;
import com.ecommerce.shop_api.exception.DuplicateResourceException;
import com.ecommerce.shop_api.repository.UserRepository;
import com.ecommerce.shop_api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.ecommerce.shop_api.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    // Register new user | 新しいユーザーを登録する
    public AuthResponse register(RegisterRequest request) {

        // Check if username already exists | ユーザー名が既に存在するか確認する
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException(
                    "Username already in use | このユーザー名は既に使用されています: " + request.getUsername()
            );
        }

        // Check if email already exists | メールアドレスが既に存在するか確認する
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already in use | このメールアドレスは既に使用されています: " + request.getEmail()
            );
        }

        // Build and save new user | 新しいユーザーを作成して保存する
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Encrypt password | パスワードを暗号化する
                .role(Role.ROLE_USER)
                .build();

        userRepository.save(user);

        // Generate JWT token | JWTトークンを生成する
        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    // Login existing user | 既存ユーザーのログイン
    public AuthResponse login(LoginRequest request) {

        // Authenticate user (throws BadCredentialsException if wrong) | ユーザーを認証する（失敗時はBadCredentialsExceptionをスロー）
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // Get authenticated user | 認証されたユーザーを取得する
        User user = (User) authentication.getPrincipal();

        // Generate JWT token | JWTトークンを生成する
        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    // Change password | パスワードを変更する
    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify current password | 現在のパスワードを確認する
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Update password | パスワードを更新する
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // Register admin user | 管理者ユーザーを登録する
    public AuthResponse registerAdmin(RegisterRequest request) {

        // Check if username already exists | ユーザー名が既に存在するか確認する
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException(
                    "Username already in use | このユーザー名は既に使用されています: " + request.getUsername()
            );
        }

        // Check if email already exists | メールアドレスが既に存在するか確認する
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already in use | このメールアドレスは既に使用されています: " + request.getEmail()
            );
        }

        // Build admin user | 管理者ユーザーを作成する
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_ADMIN) // Admin role | 管理者ロール
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
