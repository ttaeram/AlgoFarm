package com.ssafy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.ssafy.algoFarm"})
@EnableJpaRepositories(basePackages = {"com.ssafy.algoFarm"})
public class JenkinsTestApplication {
    public static void main(String[] args) {
        SpringApplication.run(JenkinsTestApplication.class, args);
    }

}
