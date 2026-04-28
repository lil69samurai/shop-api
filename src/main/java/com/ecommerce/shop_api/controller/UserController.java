package com.ecommerce.shop_api.controller;

import com.ecommerce.shop_api.entity.User;
import com.ecommerce.shop_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 獲取所有會員 (Admin)
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> safeUsers = new ArrayList<>();

        for (User u : users) {
            Map<String, Object> map = new HashMap<>();
            try { map.put("id", u.getId()); } catch(Exception e){}
            try { map.put("username", u.getUsername()); } catch(Exception e){}
            try { map.put("email", u.getEmail()); } catch(Exception e){}
            try { map.put("role", u.getRole() != null ? u.getRole().toString() : "ROLE_USER"); } catch(Exception e){}
            try { map.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : null); } catch(Exception e){}
            safeUsers.add(map);
        }
        return ResponseEntity.ok(safeUsers);
    }

    // 管理員重設會員密碼 (Admin)
    @PatchMapping("/{id}/reset-password")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> resetPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: ID " + id));

        String newPassword = request.get("newPassword");
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully for user: " + user.getUsername());
        return ResponseEntity.ok(response);
    }
}
