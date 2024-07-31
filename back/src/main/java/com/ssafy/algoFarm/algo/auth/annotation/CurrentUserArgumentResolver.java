package com.ssafy.algoFarm.algo.auth.annotation;

import com.ssafy.algoFarm.algo.auth.util.JwtUtil;
import com.ssafy.algoFarm.algo.user.UserRepository;
import com.ssafy.algoFarm.algo.user.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {
    private static final Logger logger = LoggerFactory.getLogger(CurrentUserArgumentResolver.class);
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public CurrentUserArgumentResolver(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterAnnotation(CurrentUser.class) != null &&
                parameter.getParameterType().equals(User.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        HttpServletRequest request = (HttpServletRequest) webRequest.getNativeRequest();
        String token = jwtUtil.extractTokenFromRequest(request);

        if (token == null || token.isEmpty()) {
            logger.error("No token found in request");
            throw new BadCredentialsException("No token found");
        }

        if (!jwtUtil.validateToken(token)) {
            logger.error("Invalid token");
            throw new BadCredentialsException("Invalid token");
        }

        String email = jwtUtil.getEmailFromToken(token);
        if (email == null || email.isEmpty()) {
            logger.error("No email found in token");
            throw new BadCredentialsException("No email found in token");
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("User not found for email: {}", email);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
                });
    }
}