package com.ssafy.algoFarm.algo.auth;

import com.ssafy.algoFarm.algo.user.UserProfile;
import com.ssafy.algoFarm.algo.user.UserRepository;
import com.ssafy.algoFarm.algo.user.entity.User;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.Instant;
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