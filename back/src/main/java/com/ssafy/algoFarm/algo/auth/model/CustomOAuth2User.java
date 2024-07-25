package com.ssafy.algoFarm.algo.auth.model;

import com.ssafy.algoFarm.algo.user.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

/**
 * 커스텀 OAuth2User 및 UserDetails 구현 클래스
 * 이 클래스는 OAuth2User와 UserDetails 인터페이스를 모두 구현하여
 * OAuth2 인증과 일반 인증 모두에서 사용할 수 있습니다.
 */
public class CustomOAuth2User implements OAuth2User, UserDetails {

    private final OAuth2User oauth2User;
    private final User user;

    /**
     * CustomOAuth2User 객체를 생성
     *
     * @param oauth2User 원본 OAuth2User 객체
     * @param user 애플리케이션의 User 엔티티 객체
     */
    public CustomOAuth2User(OAuth2User oauth2User, User user) {
        this.oauth2User = oauth2User;
        this.user = user;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oauth2User.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return oauth2User.getAuthorities();
    }

    @Override
    public String getName() {
        return oauth2User.getName();
    }

    /**
     * 연결된 User 엔티티 객체를 반환
     *
     * @return User 엔티티 객체
     */
    public User getUser() {
        return user;
    }

    @Override
    public <A> A getAttribute(String name) {
        return oauth2User.getAttribute(name);
    }

    // UserDetails 인터페이스 구현
    @Override
    public String getPassword() {
        return ""; // OAuth2 사용자는 비밀번호가 없으므로 빈 문자열 반환
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // 또는 user 객체의 상태에 따라 결정
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // 또는 user 객체의 상태에 따라 결정
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 또는 user 객체의 상태에 따라 결정
    }

    @Override
    public boolean isEnabled() {
        return user.getIsEmailVerified(); // 이메일 인증 상태에 따라 결정
    }
}