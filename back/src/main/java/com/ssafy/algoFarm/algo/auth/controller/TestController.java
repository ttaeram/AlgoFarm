package com.ssafy.algoFarm.algo.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/test")
    @Operation(summary = "인증 테스트", description = "현재 사용자의 인증 상태를 확인합니다.")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<?> testAuth() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
            String email = authentication.getName();
            return ResponseEntity.ok("인증된 사용자입니다. 이메일: " + email);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증되지 않은 사용자입니다.");
        }
    }
    @GetMapping("/debug/server-info")
    public String getServerInfo(HttpServletRequest request) {
        StringBuilder info = new StringBuilder();
        info.append("Server Name: ").append(request.getServerName()).append("\n");
        info.append("Server Port: ").append(request.getServerPort()).append("\n");
        info.append("Scheme: ").append(request.getScheme()).append("\n");
        info.append("X-Forwarded-Proto: ").append(request.getHeader("X-Forwarded-Proto")).append("\n");
        info.append("X-Forwarded-Host: ").append(request.getHeader("X-Forwarded-Host")).append("\n");
        info.append("X-Forwarded-Port: ").append(request.getHeader("X-Forwarded-Port")).append("\n");
        return info.toString();
    }
}
