package com.ssafy.algoFarm.algo.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DebugController {

    @GetMapping("/debug-sentry")
    public String triggerException() {
        // 의도적으로 예외 발생
        throw new RuntimeException("테스트용 예외입니다!");
    }
}
