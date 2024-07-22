package com.ssafy.algoFarm.algo.auth;

import jakarta.servlet.http.Cookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;

    public OAuth2LoginSuccessHandler(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String token = jwtUtil.generateToken(email);

        // JWT를 쿠키에 저장
        response.addCookie(createCookie("jwt", token));

        // Swagger UI로 리다이렉트
        getRedirectStrategy().sendRedirect(request, response, "/swagger-ui/index.html");
    }

    private Cookie createCookie(String name, String value) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // HTTPS에서만 사용
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60); // 24시간
        return cookie;
    }
}