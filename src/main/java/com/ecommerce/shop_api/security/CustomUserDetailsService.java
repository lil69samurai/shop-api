package com.ecommerce.shop_api.security;

import com.ecommerce.shop_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService{
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Find user by username from database | データベースからユーザー名でユーザーを検索する
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found | ユーザーが見つかりません: " + username));
    }
}
