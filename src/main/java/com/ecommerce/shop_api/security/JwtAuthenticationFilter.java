package com.ecommerce.shop_api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter{
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Get Authorization header | Authorizationヘッダーを取得する
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // Check if header exists and starts with "Bearer " | ヘッダーが存在し、「Bearer 」で始まるか確認する
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract token (Remove "Bearer ") | トークンを抽出する（「Bearer 」を削除）
        jwt = authHeader.substring(7);

        try {
            username = jwtUtil.extractUsername(jwt);

            // If username exists and user is not authenticated yet | ユーザー名が存在し、まだ認証されていない場合
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Load user from database | データベースからユーザーを読み込む
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                // If token is valid, set authentication | トークンが有効な場合、認証を設定する
                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Update SecurityContext | SecurityContextを更新する
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Log error but continue filter chain | エラーをログに記録するが、フィルターチェーンを続行する
            logger.error("JWT Authentication failed | JWT認証に失敗しました: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

}
