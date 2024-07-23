package com.ssafy.algoFarm.algo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    @GetMapping("/")
    public String root() {
        return "redirect:/home";
    }

    @GetMapping("/home")
    public String home() {
        return "home"; // home.html 뷰를 반환합니다.
    }
    @GetMapping("/oauth2/success")
    public String oauth2Success() {
        return "oauth2-success";
    }
}
