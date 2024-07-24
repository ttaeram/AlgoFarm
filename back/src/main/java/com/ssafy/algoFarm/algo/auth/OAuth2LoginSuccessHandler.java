package com.ssafy.algoFarm.algo.auth;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * OAuth2 로그인 성공 시 처리를 담당하는 핸들러
 */
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;

    /**
     * 생성자를 통한 JwtUtil 주입
     * @param jwtUtil JWT 유틸리티 클래스
     */
    public OAuth2LoginSuccessHandler(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * 인증 성공 시 호출되는 메서드
     * @param request HTTP 요청
     * @param response HTTP 응답
     * @param authentication 인증 정보
     * @throws IOException 입출력 예외
     * @throws ServletException 서블릿 예외
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // 인증된 사용자 정보 가져오기
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        // JWT 토큰 생성
        String token = jwtUtil.generateToken(email, null);

        // JWT를 쿼리 파라미터로 포함하여 /oauth2-success로 리다이렉트
        response.sendRedirect("/oauth2-success?token=" + token);
    }
}