package org.example.algo.auth;

import org.example.algo.user.User;
import org.example.algo.user.UserInfo;
import org.example.algo.user.UserProfile;
import org.example.algo.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.Instant;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    private final OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService;
    private final ClientRegistrationRepository clientRegistrationRepository;
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

            // Google의 userinfo 엔드포인트로 토큰을 사용해 사용자 정보를 가져옵니다.
            OAuth2User oauth2User = customOAuth2UserService.loadUserByToken(request.getToken());
            //System.out.println("user = " + oauth2User.getName());
            // CustomOAuth2User에서 User 객체를 가져옵니다.
            User user = ((CustomOAuth2User) oauth2User).getUser();
            //System.out.println(user.getEmail());
            String jwt = jwtUtil.generateToken(user.getEmail());
            System.out.println("jwt = " + jwt);
            return ResponseEntity.ok(new JwtResponse(jwt));
        } catch (OAuth2AuthenticationException e) {
            logger.error("Authentication error: ", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("authentication_failed", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("server_error", "An unexpected error occurred"));
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
                UserProfile userProfile = new UserProfile(user.getOAuthId(), user.getName(), user.getEmail());
                logger.info("Returning user info for email: " + email);
                return ResponseEntity.ok(userProfile);
            }
            logger.warn("User not found for email: " + email);
            return ResponseEntity.badRequest().body(new ErrorResponse("user_not_found", "User not found"));
        }
        logger.warn("Invalid token received");
        return ResponseEntity.badRequest().body(new ErrorResponse("invalid_token", "The provided token is invalid"));
    }
}
