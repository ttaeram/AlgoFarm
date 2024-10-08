package com.ssafy.algoFarm.algo.auth.security;

import com.ssafy.algoFarm.algo.auth.model.CustomOAuth2User;
import com.ssafy.algoFarm.algo.auth.util.JwtUtil;
import com.ssafy.algoFarm.algo.user.UserRepository;
import com.ssafy.algoFarm.algo.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.StringUtils;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import lombok.extern.slf4j.Slf4j;
import io.jsonwebtoken.ExpiredJwtException;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    private final List<String> excludedUrls = Arrays.asList(
            "/v3/api-docs", "/swagger-ui", "/auth", "/", "/home", "/login", "/oauth2", "/chat-websocket"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            final String jwt = jwtUtil.extractTokenFromRequest(request);
            log.debug("Extracted JWT from request: {}", jwt);

            if (StringUtils.hasText(jwt)) {
                String email;
                String validJwt = jwt;
                try {
                    email = jwtUtil.getEmailFromToken(jwt);
                } catch (ExpiredJwtException e) {
                    log.info("Token expired. Generating new token...");
                    email = e.getClaims().getSubject();
                    validJwt = jwtUtil.generateToken(email, null);
                    response.setHeader("Authorization", "Bearer " + validJwt);
                }

                final String finalEmail = email;
                final String finalJwt = validJwt;

                userRepository.findByEmail(finalEmail)
                        .ifPresentOrElse(
                                user -> {
                                    log.debug("Email extracted from JWT: {}", finalEmail);
                                    CustomOAuth2User oauth2User = new CustomOAuth2User(user, user.getAttributes());
                                    OAuth2AuthenticationToken authentication = new OAuth2AuthenticationToken(
                                            oauth2User, oauth2User.getAuthorities(), user.getProvider());
                                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                                    SecurityContextHolder.getContext().setAuthentication(authentication);
                                    log.debug("Set authentication for user: {}", finalEmail);
                                },
                                () -> {
                                    log.warn("User not found with email: {}", finalEmail);
                                    throw new UsernameNotFoundException("User not found with email: " + finalEmail);
                                }
                        );
            }
        } catch (UsernameNotFoundException e) {
            log.error("User not found", e);
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Authentication error: " + e.getMessage());
            return;
        } catch (Exception e) {
            log.error("Could not set user authentication in security context", e);
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Authentication error: " + e.getMessage());
            return;
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        boolean shouldNotFilter = excludedUrls.stream()
                .anyMatch(url -> path.equals(url) || path.startsWith(url + "/"));
        if (shouldNotFilter) {
            log.debug("Skipping JWT filter for path: {}", path);
        } else {
            log.debug("Applying JWT filter for path: {}", path);
        }
        return shouldNotFilter;
    }
}