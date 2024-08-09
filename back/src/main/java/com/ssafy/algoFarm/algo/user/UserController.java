package com.ssafy.algoFarm.algo.user;

import com.ssafy.algoFarm.algo.auth.annotation.CurrentUser;
import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.global.response.MessageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "현재 로그인한 사용자 정보", description = "현재 사용자의 정보를 확인합니다.")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<UserInfo> getCurrentUser(@Parameter(hidden = true) @CurrentUser User user) {
        UserInfo userInfo = UserInfo.builder()
                .user_id(user.getId())
                .email_verified(user.getIsEmailVerified())
                .email(user.getEmail())
                .provider(user.getProvider())
                .name(user.getName()).build();

        return ResponseEntity.ok(userInfo);
    }

    @DeleteMapping("/users/me")
    @Operation(summary = "회원 탈퇴", description = "현재 사용자의 회원탈퇴를 진행합니다.")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<MessageResponse> withdraw(@Parameter(hidden = true) @CurrentUser User user) {
        userService.withdraw(user.getId());
        return new ResponseEntity<>(MessageResponse.of(HttpStatus.ACCEPTED, "회원탈퇴 완료"), HttpStatus.OK);
    }
}