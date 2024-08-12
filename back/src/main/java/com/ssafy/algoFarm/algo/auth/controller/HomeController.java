package com.ssafy.algoFarm.algo.auth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
public class HomeController {
    private static final Logger logger = LoggerFactory.getLogger(HomeController.class);

    @PostMapping("/")
    public String rootPost() {
        logger.info("루트 경로 POST 요청 처리");
        return "redirect:/home";
    }

    @GetMapping("/")
    public String rootGet() {
        logger.info("루트 경로 GET 요청 처리");
        return "redirect:/home";
    }
    @GetMapping("/home")
    public String home() {
        return "home"; // home.html 뷰를 반환합니다.
    }

    @GetMapping("/oauth2-success")
    public String oauth2Success(@RequestParam String token, Model model) {
        model.addAttribute("token", token);
        return "oauth2-success"; // oauth2-success.html 뷰를 반환합니다.
    }
}
