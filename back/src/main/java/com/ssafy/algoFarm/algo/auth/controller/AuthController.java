package com.ssafy.algoFarm.algo.auth.controller;

import com.ssafy.algoFarm.algo.auth.model.CustomOAuth2User;
import com.ssafy.algoFarm.algo.auth.model.ErrorResponse;
import com.ssafy.algoFarm.algo.auth.model.GoogleTokenRequest;
import com.ssafy.algoFarm.algo.auth.model.JwtResponse;
import com.ssafy.algoFarm.algo.auth.service.CustomOAuth2UserService;
import com.ssafy.algoFarm.algo.auth.util.JwtUtil;
import com.ssafy.algoFarm.algo.user.UserRepository;
import com.ssafy.algoFarm.algo.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * 인증 관련 API를 처리하는 컨트롤러 클래스입니다.
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "Auth API", description = "인증 관련 API")
@RequiredArgsConstructor
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final CustomOAuth2UserService customOAuth2UserService;

    /**
     * Google 토큰을 사용하여 인증을 수행합니다.
     *
     * @param request Google 토큰 요청 객체
     * @return JWT 토큰 또는 에러 응답
     */
    @PostMapping("/google")
    public ResponseEntity<?> authenticateWithGoogle(@RequestBody GoogleTokenRequest request) {
        try {
            logger.info("Received Google token for authentication: {}", request.getToken());

            CustomOAuth2User oauth2User = customOAuth2UserService.loadUserByToken(request.getToken(), "google");
            User user = oauth2User.getUser();

            String jwt = jwtUtil.generateToken(user.getEmail(), null);

            // Create authentication token and set it in SecurityContextHolder
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(oauth2User, null, oauth2User.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authToken);

            logger.info("JWT generated and authentication set for user: {}", user.getEmail());
            return ResponseEntity.ok(new JwtResponse(jwt));
        } catch (OAuth2AuthenticationException e) {
            logger.error("Google authentication failed: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .body(new ErrorResponse("authentication_failed", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during authentication", e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse("server_error", "An unexpected error occurred"));
        }
    }

    /**
     * 인증된 사용자의 정보를 조회합니다.
     *
     * @param token JWT 토큰
     * @return 사용자 정보 또는 에러 응답
     */
    @GetMapping("/userinfo")
    @Operation(summary = "사용자 정보 조회", description = "인증된 사용자의 정보를 조회합니다.")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String token) {
        logger.info("Received request for user info");
        String jwt = extractJwtFromToken(token);

        JwtUtil.TokenValidationResult validationResult = jwtUtil.validateToken(jwt);
        if (!validationResult.isValid()) {
            logger.warn("Invalid token: {}", validationResult.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token: " + validationResult.getMessage()));
        }

        try {
            String email = jwtUtil.getEmailFromToken(jwt);
            logger.info("Extracted email from token: {}", email);

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                Map<String, Object> userInfo = Map.of(
                        "sub", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "provider", user.getProvider(),
                        "email_verified", user.getIsEmailVerified()
                );

                logger.info("Returning user info for email: {}", user.getEmail());
                return ResponseEntity.ok(userInfo);
            } else {
                logger.warn("User not found for email: {}", email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }
        } catch (Exception e) {
            logger.error("Error processing user info request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An internal error occurred"));
        }
    }

    private String extractJwtFromToken(String token) {
        if (token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return token;
    }
}