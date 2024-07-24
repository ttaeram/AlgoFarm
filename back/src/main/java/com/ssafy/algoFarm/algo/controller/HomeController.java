package com.ssafy.algoFarm.algo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

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
    @GetMapping("/oauth2-success")
    public String oauth2Success(@RequestParam String token, Model model) {
        model.addAttribute("token", token);
        return "oauth2-success"; // oauth2-success.html 뷰를 반환합니다.
    }
}
