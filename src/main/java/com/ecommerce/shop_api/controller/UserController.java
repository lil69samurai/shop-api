package com.ecommerce.shop_api.controller;

import com.ecommerce.shop_api.entity.User;
import com.ecommerce.shop_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> safeUsers = new ArrayList<>();
        
        // 手動轉換為 Map，避免關聯物件(如 Order)導致 JSON 序列化無限迴圈當機
        for (User u : users) {
            Map<String, Object> map = new HashMap<>();
            try { map.put("id", u.getId()); } catch(Exception e){}
            try { map.put("username", u.getUsername()); } catch(Exception e){}
            try { map.put("email", u.getEmail()); } catch(Exception e){}
            try { map.put("role", u.getRole() != null ? u.getRole().toString() : "USER"); } catch(Exception e){}
            safeUsers.add(map);
        }
        return ResponseEntity.ok(safeUsers);
    }
}
