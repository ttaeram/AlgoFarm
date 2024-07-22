package org.example.algo.auth;

import org.example.algo.user.User;
import org.example.algo.user.UserProfile;
import org.example.algo.user.UserRepository;
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

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        Map<String, Object> attributes = oAuth2User.getAttributes();

        UserProfile userProfile = extractUserProfile(registrationId, attributes);
        User user = saveOrUpdateUser(userProfile);

        return new CustomOAuth2User(oAuth2User, user);
    }
    public OAuth2User loadUserByToken(String token) {
        // Google의 userinfo 엔드포인트 URL
        String userInfoEndpointUri = "https://www.googleapis.com/oauth2/v3/userinfo";

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<String> entity = new HttpEntity<>("", headers);

        ResponseEntity<Map> response = restTemplate.exchange(userInfoEndpointUri, HttpMethod.GET, entity, Map.class);
        Map<String, Object> userAttributes = response.getBody();

        UserProfile userProfile = extractUserProfile("google", userAttributes);
        User user = saveOrUpdateUser(userProfile);
        //System.out.println("user = " + user);
        return new CustomOAuth2User(new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                userAttributes, "sub"), user);
    }
    private UserProfile extractUserProfile(String registrationId, Map<String, Object> attributes) {
        if ("google".equals(registrationId)) {
            return new UserProfile(
                    (String) attributes.get("sub"),
                    (String) attributes.get("name"),
                    (String) attributes.get("email")
            );
        }
        throw new OAuth2AuthenticationException("Unsupported OAuth2 provider: " + registrationId);
    }

    private User saveOrUpdateUser(UserProfile userProfile) {
        return userRepository.findByEmail(userProfile.email())
                .map(user -> {
                    // 기존 사용자 업데이트
                    user.setName(userProfile.name());

                    if (user.getOAuthId() == null) {
                        user.setOAuthId(userProfile.oAuthId());
                    }
                    user.setUpdatedAt(Instant.now());
                    return userRepository.save(user);
                })
                .orElseGet(() -> {
                    // 새 사용자 생성
                    User newUser = User.builder()
                            .oAuthId(userProfile.oAuthId())
                            .name(userProfile.name())
                            .email(userProfile.email())
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            // 추가 필드 설정
                            .isEmailVerified(true)  // OAuth를 통한 로그인이므로 이메일이 확인됨
                            .provider("GOOGLE")
                            .build();
                    return userRepository.save(newUser);
                });
    }
}