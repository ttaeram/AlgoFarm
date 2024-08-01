package com.ssafy;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition(servers = {@Server(url = "https://i11a302.p.ssafy.io")})
public class AlgoFarmApplication {
    public static void main(String[] args) {
        SpringApplication.run(AlgoFarmApplication.class, args);
    }
}