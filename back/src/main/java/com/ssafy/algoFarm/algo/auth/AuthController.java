package com.ssafy.algoFarm.algo.auth;

import com.ssafy.algoFarm.algo.user.UserProfile;
import com.ssafy.algoFarm.algo.user.UserRepository;
import com.ssafy.algoFarm.algo.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.algo.auth.ErrorResponse;
import org.example.algo.auth.GoogleTokenRequest;
import org.example.algo.auth.JwtResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@Tag(name = "Auth API", description = "Sample API for demonstration")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;

    private final OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService;

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    public AuthController(OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService, ClientRegistrationRepository clientRegistrationRepository) {
        this.oauth2UserService = oauth2UserService;
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @PostMapping("/google")
    public ResponseEntity<?> authenticateWithGoogle(@RequestBody GoogleTokenRequest request) {
        try {
            logger.info("Received token: " + request.getToken());

            // Google의 client registration을 가져옵니다.
            ClientRegistration clientRegistration = clientRegistrationRepository.findByRegistrationId("google");

            if (clientRegistration == null) {
                logger.error("Google client registration not found");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ErrorResponse("configuration_error", "Google OAuth configuration not found"));
            }

            // OAuth2User 객체를 직접 로드합니다.
            OAuth2User oauth2User = customOAuth2UserService.loadUserByToken(request.getToken());

            // CustomOAuth2User에서 User 객체를 가져옵니다.
            User user = ((CustomOAuth2User) oauth2User).getUser();

            String jwt = jwtUtil.generateToken(user.getEmail());
            logger.info("Generated JWT for user: {}", user.getEmail());

            return ResponseEntity.ok(new JwtResponse(jwt));
        } catch (OAuth2AuthenticationException e) {
            logger.error("Authentication error: ", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("authentication_failed", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("server_error", "An unexpected error occurred"));
        }
    }

    @GetMapping("/userinfo")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String token) {
        logger.info("Received request for user info with token: " + token);
        String jwt = token.replace("Bearer ", "");
        if (jwtUtil.validateToken(jwt)) {
            String email = jwtUtil.getEmailFromToken(jwt);
            logger.info("Extracted email from token: " + email);
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();

                Map<String, Object> attributes = new HashMap<>();
                attributes.put("sub", user.getOAuthId());
                attributes.put("name", user.getName());
                attributes.put("email", user.getEmail());
                attributes.put("provider", user.getProvider());
                attributes.put("email_verified", user.getIsEmailVerified());
                // 필요한 경우 여기에 추가 속성을 넣을 수 있습니다.

                UserProfile userProfile = new UserProfile(
                        user.getOAuthId(),
                        user.getName(),
                        user.getEmail(),
                        attributes
                );

                logger.info("Returning user info for email: " + email);
                return ResponseEntity.ok(userProfile);
            }
            logger.warn("User not found for email: " + email);
            return ResponseEntity.badRequest().body(new ErrorResponse("user_not_found", "User not found"));
        }
        logger.warn("Invalid token received");
        return ResponseEntity.badRequest().body(new ErrorResponse("invalid_token", "The provided token is invalid"));
    }
    @GetMapping("/test")
    @Operation(summary = "인증 테스트", description = "현재 사용자의 인증 상태를 확인합니다.")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> testAuth() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            String email = null;

            if (principal instanceof UserDetails) {
                email = ((UserDetails)principal).getUsername();
            } else if (principal instanceof OAuth2User) {
                email = ((OAuth2User) principal).getAttribute("email");
            } else if (principal instanceof String) {
                // JWT 토큰을 사용하는 경우, principal이 문자열(일반적으로 subject)일 수 있습니다.
                email = (String) principal;
            }

            if (email != null) {
                return ResponseEntity.ok("인증된 사용자입니다. 이메일: " + email);
            } else {
                return ResponseEntity.ok("인증된 사용자입니다. 이메일을 찾을 수 없습니다.");
            }
        } else {
            return ResponseEntity.status(401).body("인증되지 않은 사용자입니다.");
        }
    }
}
