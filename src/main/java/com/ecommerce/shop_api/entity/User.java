package com.ecommerce.shop_api.entity;

import com.ecommerce.shop_api.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.role == null) {
            this.role = Role.ROLE_USER;
        }
    }
    // ==========================================
    // Spring Security Methods | セキュリティメソッド
    // ==========================================
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Return user role | ユーザーのロールを返す
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Account is not expired | アカウントは有効期限切れではありません
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Account is not locked | アカウントはロックされていません
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Password is not expired | パスワードは有効期限切れではありません
    }

    @Override
    public boolean isEnabled() {
        return true; // Account is enabled | アカウントは有効です
    }
}