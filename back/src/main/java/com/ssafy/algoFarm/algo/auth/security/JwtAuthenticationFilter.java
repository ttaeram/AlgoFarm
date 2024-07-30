package com.ssafy.algoFarm.algo.auth.security;

import com.ssafy.algoFarm.algo.auth.model.CustomOAuth2User;
import com.ssafy.algoFarm.algo.auth.util.JwtUtil;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.StringUtils;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

import lombok.extern.slf4j.Slf4j;

/**
 * JWT 인증을 처리하는 필터
 * 모든 요청에 대해 JWT 토큰을 확인하고 유효한 경우 인증 정보를 설정합니다.
 */
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    /**
     * JwtAuthenticationFilter 생성자
     *
     * @param jwtUtil JWT 유틸리티 클래스
     * @param userDetailsService 사용자 상세 정보 서비스
     */
    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            if (StringUtils.hasText(jwt) && jwtUtil.validateToken(jwt)) {
                String email = jwtUtil.getEmailFromToken(jwt);
                CustomOAuth2User userDetails = (CustomOAuth2User) userDetailsService.loadUserByUsername(email);
                OAuth2AuthenticationToken authentication = new OAuth2AuthenticationToken(
                        userDetails, userDetails.getAuthorities(), userDetails.getUser().getProvider());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * HTTP 요청에서 JWT 토큰을 추출합니다.
     *
     * @param request HTTP 요청
     * @return 추출된 JWT 토큰, 없으면 null
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    /**
     * 특정 요청에 대해 이 필터를 적용하지 않아야 하는지 결정합니다.
     *
     * @param request 현재 요청
     * @return true이면 이 필터를 건너뜁니다.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // JWT 인증이 필요 없는 경로들을 여기서 정의합니다.
        return path.startsWith("/auth") || path.equals("/") || path.equals("/home") || path.startsWith("/oauth2") ||path.equals("/chat-websocket");
    }
}