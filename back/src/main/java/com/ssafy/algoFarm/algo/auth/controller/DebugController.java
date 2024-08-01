package com.ssafy.algoFarm.algo.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DebugController {

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