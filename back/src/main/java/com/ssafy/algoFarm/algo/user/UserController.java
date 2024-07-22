package com.ssafy.algoFarm.algo.user;

import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.algo.auth.CustomOAuth2User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    @GetMapping("/user")
    public ResponseEntity<UserProfile> getCurrentUser(@AuthenticationPrincipal CustomOAuth2User customOAuth2User) {
        User user = customOAuth2User.getUser();

        // User 엔티티의 정보를 사용하여 attributes 맵 생성
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", user.getOAuthId());
        attributes.put("name", user.getName());
        attributes.put("email", user.getEmail());
        attributes.put("provider", user.getProvider());
        attributes.put("email_verified", user.getIsEmailVerified());

        UserProfile userProfile = new UserProfile(
                user.getOAuthId(),
                user.getName(),
                user.getEmail(),
                attributes
        );

        return ResponseEntity.ok(userProfile);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adminOnly() {
        return ResponseEntity.ok("Admin access granted");
    }
}
