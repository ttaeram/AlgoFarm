package com.ssafy.global.swagger;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Value("${spring.profiles.active}")
    private String activeProfile;

    @Bean
    public OpenAPI customOpenAPI() {
        Server server = new Server();
        if ("prod".equals(activeProfile)) {
            server.setUrl("https://i11a302.p.ssafy.io");
        } else {
            server.setUrl("http://localhost:8080");
        }

        return new OpenAPI()
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                        )
                )
                .info(new Info().title("AlgoFarm API")
                        .description("AlgoFarm application API documentation. Use the Authorize button to input your JWT token.")
                        .version("v1.0.0"))
                .servers(List.of(server));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("public")
                .pathsToMatch("/api/**")  // API 경로에 따라 조정
                .build();
    }

    @Bean
    public GroupedOpenApi privateApi() {
        return GroupedOpenApi.builder()
                .group("private")
                .pathsToMatch("/api/**")  // API 경로에 따라 조정
                .build();
    }
}