package com.ssafy.algoFarm.algo.auth.service;

import com.ssafy.algoFarm.algo.auth.model.CustomOAuth2User;
import com.ssafy.algoFarm.algo.user.UserProfile;
import com.ssafy.algoFarm.algo.user.UserRepository;
import com.ssafy.algoFarm.algo.user.entity.User;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Collections;
import java.util.Map;

/**
 * 커스텀 OAuth2UserService 구현 클래스입니다.
 * 이 클래스는 OAuth2 인증 후 사용자 정보를 처리하고
 * 애플리케이션의 User 엔티티와 연동합니다.
 */
@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    private final RestTemplate restTemplate;

    /**
     * CustomOAuth2UserService 객체를 생성합니다.
     *
     * @param userRepository User 엔티티 리포지토리
     */
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

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        UserProfile userProfile = extractUserProfile(registrationId, attributes);
        User user = saveOrUpdateUser(userProfile, registrationId);

        return new CustomOAuth2User(oAuth2User, user);
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
                    return userRepository.save(newUser);
                });
    }

    /**
     * 토큰을 사용하여 OAuth2User를 로드합니다.
     *
     * @param token OAuth2 액세스 토큰
     * @param provider OAuth2 공급자 (예: "google")
     * @return OAuth2User 객체
     */
    public OAuth2User loadUserByToken(String token, String provider) {
        UserProfile userProfile = getUserInfoFromProvider(token, provider);
        User user = saveOrUpdateUser(userProfile, provider);
        return new CustomOAuth2User(new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                userProfile.getAttributes(),
                "sub"), user);
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
        String userInfoEndpoint;
        switch(provider.toLowerCase()) {
            case "google":
                userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";
                break;
            // 다른 공급자에 대한 case를 여기에 추가
            default:
                throw new OAuth2AuthenticationException("Unsupported OAuth2 provider: " + provider);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<String> entity = new HttpEntity<>("", headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                userInfoEndpoint,
                HttpMethod.GET,
                entity,
                Map.class
        );

        Map<String, Object> attributes = response.getBody();
        if (attributes == null) {
            throw new OAuth2AuthenticationException("Failed to get user info from " + provider);
        }

        return new UserProfile(
                (String) attributes.get("sub"),
                (String) attributes.get("name"),
                (String) attributes.get("email"),
                attributes
        );
    }
}