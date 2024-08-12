package com.ssafy.algoFarm.algo.auth.util;

import io.jsonwebtoken.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Slf4j
public class JwtUtil {

    @Value("${jwt.private.key}")
    private Resource privateKeyResource;

    @Value("${jwt.public.key}")
    private Resource publicKeyResource;

    @Value("${jwt.expiration}")
    private long expirationTime;

    private RSAPrivateKey privateKey;
    private RSAPublicKey publicKey;

    @PostConstruct
    public void init() {
        try {
            privateKey = parsePrivateKey(privateKeyResource);
            publicKey = parsePublicKey(publicKeyResource);
            log.info("JWT keys initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize JWT keys", e);
            throw new JwtException("Failed to initialize JWT keys", e);
        }
    }

    private RSAPrivateKey parsePrivateKey(Resource resource) throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
        String privateKeyPEM = readPEMContent(resource);
        byte[] encoded = Base64.getDecoder().decode(privateKeyPEM);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(encoded);
        return (RSAPrivateKey) keyFactory.generatePrivate(keySpec);
    }

    private RSAPublicKey parsePublicKey(Resource resource) throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
        String publicKeyPEM = readPEMContent(resource);
        byte[] encoded = Base64.getDecoder().decode(publicKeyPEM);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(encoded);
        return (RSAPublicKey) keyFactory.generatePublic(keySpec);
    }

    private String readPEMContent(Resource resource) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
            return reader.lines()
                    .filter(line -> !line.startsWith("-----BEGIN") && !line.startsWith("-----END"))
                    .collect(Collectors.joining());
        }
    }

    public String generateToken(String email, Map<String, Object> additionalClaims) {
        log.debug("Generating JWT token for email: {}", email);
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        JwtBuilder builder = Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiryDate);

        if (additionalClaims != null) {
            additionalClaims.forEach(builder::claim);
        }

        String token = builder.signWith(privateKey, SignatureAlgorithm.RS256).compact();
        log.debug("JWT token generated successfully");
        return token;
    }

    private String generateToken(String email, Map<String, Object> additionalClaims, long expiration) {
        log.debug("Generating JWT token for email: {}", email);
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        JwtBuilder builder = Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiryDate);

        if (additionalClaims != null) {
            additionalClaims.forEach(builder::claim);
        }

        String token = builder.signWith(privateKey, SignatureAlgorithm.RS256).compact();
        log.debug("JWT token generated successfully");
        return token;
    }

    public TokenValidationResult validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(publicKey).build().parseClaimsJws(token);
            log.debug("Token validated successfully");
            return new TokenValidationResult(true, "Token is valid");
        } catch (ExpiredJwtException e) {
            log.debug("Token is expired", e);
            return new TokenValidationResult(false, "Token is expired");
        } catch (JwtException e) {
            log.error("Invalid token: {}", e.getMessage());
            return new TokenValidationResult(false, e.getMessage());
        }
    }

    private TokenValidationResult validateTokenInternal(String token, String tokenType) {
        try {
            Jwts.parserBuilder().setSigningKey(publicKey).build().parseClaimsJws(token);
            log.debug("{} validated successfully", tokenType);
            return new TokenValidationResult(true, tokenType + " is valid");
        } catch (JwtException e) {
            log.error("Invalid {}: {}", tokenType, e.getMessage());
            return new TokenValidationResult(false, e.getMessage());
        }
    }

    public String getEmailFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(publicKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (ExpiredJwtException e) {
            // 만료된 토큰에서도 이메일을 추출할 수 있도록 합니다.
            return e.getClaims().getSubject();
        }
    }

    public String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            log.debug("JWT token extracted from request");
            return token;
        }
        log.debug("No JWT token found in request");
        return null;
    }

    public record TokenValidationResult(boolean isValid, String message) {
    }
}