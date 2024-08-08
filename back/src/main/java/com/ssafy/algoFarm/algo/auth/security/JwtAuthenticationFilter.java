package com.ssafy.algoFarm.algo.auth.security;

import com.ssafy.algoFarm.algo.auth.model.CustomOAuth2User;
import com.ssafy.algoFarm.algo.auth.service.CustomOAuth2UserService;
import com.ssafy.algoFarm.algo.auth.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final List<String> excludedUrls = Arrays.asList(
            "/v3/api-docs", "/swagger-ui", "/auth", "/", "/home", "/login", "/oauth2", "/chat-websocket"
    );

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomOAuth2UserService customOAuth2UserService) {
        this.jwtUtil = jwtUtil;
        this.customOAuth2UserService = customOAuth2UserService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = jwtUtil.extractTokenFromRequest(request);
            log.debug("Extracted JWT from request: {}", jwt);

            if (StringUtils.hasText(jwt)) {
                JwtUtil.TokenValidationResult validationResult = jwtUtil.validateToken(jwt);
                if (validationResult.isValid()) {
                    String email = jwtUtil.getEmailFromToken(jwt);
                    log.debug("Email extracted from JWT: {}", email);

                    CustomOAuth2User oauth2User = customOAuth2UserService.loadUserByToken(jwt, "JWT");
                    OAuth2AuthenticationToken authentication = new OAuth2AuthenticationToken(
                            oauth2User, oauth2User.getAuthorities(), oauth2User.getUser().getProvider());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("Set authentication for user: {}", email);
                } else {
                    log.warn("Invalid token: {}", validationResult.getMessage());
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.getWriter().write("Invalid token: " + validationResult.getMessage());
                    return;
                }
            }
        } catch (Exception e) {
            log.error("Could not set user authentication in security context", e);
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.getWriter().write("Authentication error: " + e.getMessage());
            return;
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        boolean shouldNotFilter = excludedUrls.stream().anyMatch(path::startsWith);
        if (shouldNotFilter) {
            log.debug("Skipping JWT filter for path: {}", path);
        }
        return shouldNotFilter;
    }
}