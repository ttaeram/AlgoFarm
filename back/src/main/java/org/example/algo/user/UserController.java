package org.example.algo.user;

import org.example.algo.auth.CustomOAuth2User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserController {

    @GetMapping("/user")
    public ResponseEntity<UserProfile> getCurrentUser(@AuthenticationPrincipal CustomOAuth2User customOAuth2User) {
        User user = customOAuth2User.getUser();
        UserProfile userProfile = new UserProfile(user.getOAuthId(), user.getName(), user.getEmail());
        return ResponseEntity.ok(userProfile);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adminOnly() {
        return ResponseEntity.ok("Admin access granted");
    }
}
