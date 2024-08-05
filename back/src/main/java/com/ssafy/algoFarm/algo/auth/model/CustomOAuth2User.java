package com.ssafy.algoFarm.algo.auth.model;

import com.ssafy.algoFarm.algo.user.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User, UserDetails {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2User.class);

    private final User user;
    private final Map<String, Object> attributes;

    public CustomOAuth2User(User user, Map<String, Object> attributes) {
        this.user = user;
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getName() {
        return user.getName();
    }

    public User getUser() {
        return user;
    }

    @Override
    public <A> A getAttribute(String name) {
        return (A) attributes.get(name);
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
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.getIsEmailVerified();
    }

    // 추가 메서드
    public String getEmail() {
        return user.getEmail();
    }

    public String getOAuthId() {
        return user.getOAuthId();
    }

    @Override
    public String toString() {
        return "CustomOAuth2User{" +
                "email='" + getEmail() + '\'' +
                ", name='" + getName() + '\'' +
                ", oAuthId='" + getOAuthId() + '\'' +
                '}';
    }
}