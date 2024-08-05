package com.ssafy.algoFarm.algo.auth.service;

import com.ssafy.algoFarm.algo.auth.model.CustomOAuth2User;
import com.ssafy.algoFarm.algo.user.UserProfile;
import com.ssafy.algoFarm.algo.user.UserRepository;
import com.ssafy.algoFarm.algo.user.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * 커스텀 OAuth2UserService 구현 클래스입니다.
 * 이 클래스는 OAuth2 인증 후 사용자 정보를 처리하고
 * 애플리케이션의 User 엔티티와 연동합니다.
 */
@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User>, UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.restTemplate = new RestTemplate();
    }


    /**
     * OAuth2UserRequest를 처리하여 OAuth2User를 반환합니다.
     *
     * @param userRequest OAuth2UserRequest 객체
     * @return CustomOAuth2User 객체
     * @throws OAuth2AuthenticationException OAuth2 인증 예외
     */
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        System.out.println("OAuth2User: " + oAuth2User);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        UserProfile userProfile = extractUserProfile(registrationId, attributes);
        User user = saveOrUpdateUser(userProfile, registrationId);

        return new CustomOAuth2User(user, userProfile.getAttributes());
    }

    /**
     * OAuth2 공급자의 속성에서 UserProfile을 추출합니다.
     *
     * @param registrationId OAuth2 공급자 ID
     * @param attributes OAuth2 사용자 속성
     * @return UserProfile 객체
     * @throws OAuth2AuthenticationException 지원되지 않는 OAuth2 공급자일 경우
     */
    private UserProfile extractUserProfile(String registrationId, Map<String, Object> attributes) {
        switch(registrationId) {
            case "google":
                return new UserProfile(
                        (String) attributes.get("sub"),
                        (String) attributes.get("name"),
                        (String) attributes.get("email"),
                        attributes
                );
            // 다른 공급자에 대한 case를 여기에 추가
            default:
                throw new OAuth2AuthenticationException("Unsupported OAuth2 provider: " + registrationId);
        }
    }

    /**
     * UserProfile 정보를 기반으로 User 엔티티를 저장하거나 업데이트합니다.
     *
     * @param userProfile UserProfile 객체
     * @return 저장되거나 업데이트된 User 엔티티
     */
    private User saveOrUpdateUser(UserProfile userProfile, String provider) {
        return userRepository.findByEmail(userProfile.email())
                .map(user -> {
                    user.setName(userProfile.name());
                    if (user.getOAuthId() == null) {
                        user.setOAuthId(userProfile.oAuthId());
                    }
                    user.setUpdatedAt(Instant.now());
                    logger.info("Updating existing user: {}", user.getEmail());
                    return userRepository.save(user);
                })
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .oAuthId(userProfile.oAuthId())
                            .name(userProfile.name())
                            .email(userProfile.email())
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            .isEmailVerified(true)
                            .provider(provider.toUpperCase())
                            .build();
                    logger.info("Creating new user: {}", newUser.getEmail());
                    return userRepository.save(newUser);
                });
    }

    /**
     * 토큰을 사용하여 OAuth2User를 로드합니다.
     *
     * @param email OAuth2 액세스 토큰
     * @return OAuth2User 객체
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.debug("Loading user by email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("User not found with email: {}", email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", user.getOAuthId());
        attributes.put("name", user.getName());
        attributes.put("email", user.getEmail());

        logger.debug("User loaded successfully: {}", user.getEmail());

        return new CustomOAuth2User(user, attributes);
    }

    public CustomOAuth2User loadUserByToken(String token, String provider) {
        logger.debug("Loading user by token for provider: {}", provider);

        try {
            // Google의 토큰 정보 엔드포인트
            String tokenInfoEndpoint = "https://oauth2.googleapis.com/tokeninfo?access_token=" + token;

            ResponseEntity<Map> response = restTemplate.getForEntity(tokenInfoEndpoint, Map.class);

            if (response.getStatusCode() != HttpStatus.OK) {
                logger.error("Failed to validate token. Status: {}", response.getStatusCode());
                throw new OAuth2AuthenticationException("Invalid token for " + provider);
            }

            Map<String, Object> tokenInfo = response.getBody();

            // 토큰이 유효한 경우, 사용자 정보를 가져옵니다.
            String userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<String> entity = new HttpEntity<>("", headers);

            response = restTemplate.exchange(userInfoEndpoint, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode() != HttpStatus.OK) {
                logger.error("Failed to get user info. Status: {}", response.getStatusCode());
                throw new OAuth2AuthenticationException("Failed to get user info from " + provider);
            }

            Map<String, Object> userAttributes = response.getBody();
            String email = (String) userAttributes.get("email");
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> createNewUser(userAttributes, provider));

            return new CustomOAuth2User(user, userAttributes);

        } catch (RestClientException e) {
            logger.error("RestClientException while validating token or getting user info: {}", e.getMessage());
            throw new OAuth2AuthenticationException("Failed to authenticate with " + provider);
        }
    }
    private String getUserInfoEndpoint(String provider) {
        switch(provider.toLowerCase()) {
            case "google":
                return "https://www.googleapis.com/oauth2/v3/userinfo";
            // 다른 제공자에 대한 case 추가
            default:
                throw new OAuth2AuthenticationException("Unsupported OAuth2 provider: " + provider);
        }
    }
    private User createNewUser(Map<String, Object> attributes, String provider) {
        User newUser = User.builder()
                .email((String) attributes.get("email"))
                .name((String) attributes.get("name"))
                .oAuthId((String) attributes.get("sub"))
                .provider(provider.toUpperCase())
                .isEmailVerified(true)
                .build();
        return userRepository.save(newUser);
    }
    /**
     * OAuth2 공급자로부터 사용자 정보를 가져옵니다.
     *
     * @param token OAuth2 액세스 토큰
     * @param provider OAuth2 공급자
     * @return UserProfile 객체
     * @throws OAuth2AuthenticationException 지원되지 않는 공급자이거나 사용자 정보를 가져오는데 실패한 경우
     */
    private UserProfile getUserInfoFromProvider(String token, String provider) {
        String userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";  // Google의 경우

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<String> entity = new HttpEntity<>("", headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    userInfoEndpoint,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            if (response.getStatusCode() != HttpStatus.OK) {
                logger.error("Failed to get user info. Status: {}", response.getStatusCode());
                throw new OAuth2AuthenticationException(new OAuth2Error("user_info_error"), "Failed to get user info from " + provider);
            }

            Map<String, Object> attributes = response.getBody();
            if (attributes == null) {
                logger.error("User info response body is null");
                throw new OAuth2AuthenticationException(new OAuth2Error("empty_response"), "Empty response from " + provider);
            }

            return new UserProfile(
                    (String) attributes.get("sub"),
                    (String) attributes.get("name"),
                    (String) attributes.get("email"),
                    attributes
            );
        } catch (RestClientException e) {
            logger.error("RestClientException while getting user info: {}", e.getMessage());
            throw new OAuth2AuthenticationException(new OAuth2Error("user_info_error"), "Failed to get user info from " + provider + ": " + e.getMessage());
        }
    }

}