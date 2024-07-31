package com.ssafy.algoFarm.algo.auth.service;

import com.ssafy.algoFarm.algo.auth.model.CustomOAuth2User;
import com.ssafy.algoFarm.algo.user.UserRepository;
import com.ssafy.algoFarm.algo.user.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 사용자 정보를 로드하는 커스텀 UserDetailsService 구현
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * 생성자를 통한 UserRepository 주입
     * @param userRepository 사용자 정보 저장소
     */
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 사용자 이름(이메일)으로 사용자 정보를 로드
     * @param username 사용자 이메일
     * @return CustomOAuth2User 객체
     * @throws UsernameNotFoundException 사용자를 찾지 못한 경우
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 이메일로 사용자 조회
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));

        // OAuth2User 속성 맵 생성
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", user.getOAuthId());
        attributes.put("name", user.getName());
        attributes.put("email", user.getEmail());

        // 사용자 권한 설정
        Collection<GrantedAuthority> authorities = user.getRoles().stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        // DefaultOAuth2User 객체 생성
        OAuth2User oauth2User = new DefaultOAuth2User(authorities, attributes, "email");

        // CustomOAuth2User 객체 반환
        return new CustomOAuth2User(oauth2User, user);
    }
}