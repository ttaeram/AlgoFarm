package com.ssafy.algoFarm.algo.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.algoFarm.algo.auth.service.CustomOAuth2UserService;
import com.ssafy.algoFarm.algo.auth.util.JwtUtil;
import com.ssafy.algoFarm.algo.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.http.HttpStatus;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Map;

/**
 * Spring Security 설정을 담당하는 클래스
 * 이 클래스는 애플리케이션의 보안 정책을 정의하고 구현
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);
    private final CustomOAuth2UserService customOAuth2UserService;
    private final JwtUtil jwtUtil;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final UserRepository userRepository;
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil, userRepository);
    }

    /**
     * 보안 필터 체인을 구성
     * 이 메소드는 HTTP 보안 설정, CORS, CSRF, 인증, 인가 등을 정의
     *
     * @param http HttpSecurity 객체
     * @return 구성된 SecurityFilterChain
     * @throws Exception 보안 구성 중 발생할 수 있는 예외
     */

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http.headers(headers -> headers
                .frameOptions(frame -> frame.deny())
                .xssProtection(xss -> xss.disable())
                .httpStrictTransportSecurity(hsts -> hsts
                        .includeSubDomains(true)
                        .maxAgeInSeconds(31536000))
        );

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
                                "/auth/**", "/", "/home", "/login", "/oauth2/**", "/oauth2-success",
                                "/css/**", "/js/**", "/images/**", "/fonts/**",
                                "/*.css", "/*.js", "/*.png", "/*.jpg", "/*.jpeg", "/*.gif",
                                "/*.svg", "/*.html", "/*.ico", "/static/**", "/chat-websocket/**").permitAll()
                    .anyRequest().authenticated()
                )


                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/home")
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(new OAuth2LoginSuccessHandler(authorizedClientService))
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            String errorMessage = "Authentication failed: " + authException.getMessage();
                            response.getWriter().write(new ObjectMapper().writeValueAsString(Map.of("error", errorMessage)));
                        })
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /**
     * 테스트 환경을 위한 보안 설정 클래스입니다.
     * 이 클래스는 테스트 시 보안 설정을 간소화하여 테스트를 용이하게 함
     */
    @Configuration
    @Profile("test")
    public static class TestSecurityConfig {
        /**
         * 테스트 환경을 위한 보안 필터 체인을 구성합니다.
         * 이 메소드는 테스트 시 모든 요청을 허용하고 세션을 STATELESS로 설정
         *
         * @param http HttpSecurity 객체
         * @return 구성된 SecurityFilterChain
         * @throws Exception 보안 구성 중 발생할 수 있는 예외
         */
        @Bean
        public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
            http
                    .csrf(AbstractHttpConfigurer::disable)
                    .requiresChannel(channel -> channel
                            .anyRequest().requiresSecure())
                    .authorizeHttpRequests(authorize -> authorize
                            .anyRequest().permitAll()
                    )

                    .sessionManagement(session -> session
                            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                    );

            return http.build();
        }
    }
    @Configuration
    @Profile("local")
    public class LocalSecurityConfig {
        @Bean
        public SecurityFilterChain localSecurityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
            http
                    .csrf(AbstractHttpConfigurer::disable)
                    // .cors(cors -> cors.configurationSource(corsConfigurationSource)) // CORS 설정 주석 처리
                    .authorizeHttpRequests(authorize -> authorize
                            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
                                    "/auth/**", "/", "/home", "/login", "/oauth2/**", "/oauth2-success",
                                    "/css/**", "/js/**", "/images/**", "/fonts/**",
                                    "/*.css", "/*.js", "/*.png", "/*.jpg", "/*.jpeg", "/*.gif",
                                    "/*.svg", "/*.html", "/*.ico", "/static/**", "/chat-websocket/**").permitAll()
                            .anyRequest().authenticated()
                    )
                    .oauth2Login(oauth2 -> oauth2
                            .loginPage("/home")
                            .userInfoEndpoint(userInfo -> userInfo
                                    .userService(customOAuth2UserService)
                            )
                            .successHandler(new OAuth2LoginSuccessHandler(authorizedClientService))
                    )
                    .sessionManagement(session -> session
                            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                    )
                    .exceptionHandling(exceptions -> exceptions
                            .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                    )
                    .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

            return http.build();
        }
    }
}
