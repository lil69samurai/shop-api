package com.ecommerce.shop_api.controller;

import com.ecommerce.shop_api.dto.request.LoginRequest;
import com.ecommerce.shop_api.dto.request.RegisterRequest;
import com.ecommerce.shop_api.dto.request.GoogleAuthRequest;
import com.ecommerce.shop_api.dto.response.ApiResponse;
import com.ecommerce.shop_api.dto.response.AuthResponse;
import com.ecommerce.shop_api.dto.response.UserResponse;
import com.ecommerce.shop_api.entity.User;
import com.ecommerce.shop_api.enums.Role;
import com.ecommerce.shop_api.exception.ResourceNotFoundException;
import com.ecommerce.shop_api.repository.UserRepository;
import com.ecommerce.shop_api.security.JwtUtil;
import com.ecommerce.shop_api.service.AuthService;
import com.ecommerce.shop_api.dto.request.ChangePasswordRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register-admin")
    public ResponseEntity<ApiResponse<AuthResponse>> registerAdmin(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Admin registration successful", response));
    }

    // ========== Google OAuth ==========
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @Valid @RequestBody GoogleAuthRequest request) {
        try {
            String clientId = System.getenv("GOOGLE_CLIENT_ID");
            if (clientId == null || clientId.isBlank()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.error("Google OAuth not configured"));
            }

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getCredential());
            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Invalid Google token"));
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            // 1. Try find by googleId
            Optional<User> existingUser = userRepository.findByGoogleId(googleId);

            User user;
            if (existingUser.isPresent()) {
                user = existingUser.get();
            } else {
                // 2. Try find by email (link accounts)
                Optional<User> emailUser = userRepository.findByEmail(email);
                if (emailUser.isPresent()) {
                    user = emailUser.get();
                    user.setGoogleId(googleId);
                    userRepository.save(user);
                } else {
                    // 3. Create new user
                    String username = generateUniqueUsername(name, email);
                    user = User.builder()
                            .username(username)
                            .email(email)
                            .password(null)
                            .googleId(googleId)
                            .role(Role.ROLE_USER)
                            .build();
                    userRepository.save(user);
                }
            }

            String jwt = jwtUtil.generateToken(user);

            AuthResponse response = AuthResponse.builder()
                    .token(jwt)
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build();

            return ResponseEntity.ok(ApiResponse.success("Google login successful", response));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Google authentication failed: " + e.getMessage()));
        }
    }

    private String generateUniqueUsername(String name, String email) {
        String base = (name != null && !name.isBlank())
                ? name.replaceAll("[^a-zA-Z0-9]", "").toLowerCase()
                : email.split("@")[0];
        if (base.length() < 3) base = base + "user";
        String candidate = base;
        int counter = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + counter;
            counter++;
        }
        return candidate;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .defaultRecipientName(user.getDefaultRecipientName())
                .defaultPhone(user.getDefaultPhone())
                .defaultZipCode(user.getDefaultZipCode())
                .defaultAddress(user.getDefaultAddress())
                .defaultNote(user.getDefaultNote())
                .build();
        return ResponseEntity.ok(ApiResponse.success("OK", response));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(
                userDetails.getUsername(),
                request.getCurrentPassword(),
                request.getNewPassword()
        );
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}
