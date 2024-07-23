package com.ssafy.algoFarm.algo.user;

import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.algo.auth.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class UserController {

    @GetMapping("/me")
    @Operation(summary = "Get current user information")
    @ApiResponse(responseCode = "200", description = "Successful operation",
            content = @Content(schema = @Schema(implementation = UserInfo.class)))
    @SecurityRequirement(name = "bearerAuth")

    public ResponseEntity<UserInfo> getCurrentUser(@Parameter(hidden = true) @CurrentUser User user) {

        UserInfo userInfo = UserInfo.builder()
                .id(user.getOAuthId())
                .email(user.getEmail())
                .verified_email(user.getIsEmailVerified())
                .name(user.getName())
                .build();

        return ResponseEntity.ok(userInfo);
    }
}