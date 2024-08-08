package com.ssafy.algoFarm.algo.auth.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.SignatureException;
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

    public TokenValidationResult validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(publicKey).build().parseClaimsJws(token);
            log.debug("JWT token validated successfully");
            return new TokenValidationResult(true, "Token is valid");
        } catch (SignatureException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
            return new TokenValidationResult(false, "Invalid signature");
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return new TokenValidationResult(false, "Malformed token");
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
            return new TokenValidationResult(false, "Token expired");
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
            return new TokenValidationResult(false, "Unsupported token");
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
            return new TokenValidationResult(false, "Empty claims");
        }
    }

    public String getEmailFromToken(String token) {
        try {
            String email = Jwts.parserBuilder()
                    .setSigningKey(publicKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
            log.debug("Email extracted from token: {}", email);
            return email;
        } catch (JwtException e) {
            log.error("Failed to extract email from token", e);
            throw new JwtException("Failed to extract email from token", e);
        }
    }

    public Object getClaimFromToken(String token, String claimName) {
        try {
            Object claim = Jwts.parserBuilder()
                    .setSigningKey(publicKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .get(claimName);
            log.debug("Claim '{}' extracted from token", claimName);
            return claim;
        } catch (JwtException e) {
            log.error("Failed to extract claim '{}' from token", claimName, e);
            throw new JwtException("Failed to extract claim from token", e);
        }
    }

    public String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            log.debug("JWT token extracted from request: {}", token);
            return token;
        }
        log.debug("No JWT token found in request. Authorization header: {}", bearerToken);
        return null;
    }

    public boolean isTokenExpired(String token) {
        try {
            Date expirationDate = Jwts.parserBuilder()
                    .setSigningKey(publicKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getExpiration();
            boolean isExpired = expirationDate.before(new Date());
            log.debug("Token expiration check - Is expired: {}", isExpired);
            return isExpired;
        } catch (ExpiredJwtException e) {
            log.debug("Token is expired", e);
            return true;
        } catch (JwtException e) {
            log.error("Error checking token expiration", e);
            return false;
        }
    }

    public String generateRefreshToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + (expirationTime * 24 * 7)); // 7일 후 만료

        String refreshToken = Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(privateKey, SignatureAlgorithm.RS256)
                .compact();

        log.debug("Refresh token generated for email: {}", email);
        return refreshToken;
    }

    public boolean validateRefreshToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(publicKey).build().parseClaimsJws(token);
            boolean isValid = !isTokenExpired(token);
            log.debug("Refresh token validation result: {}", isValid);
            return isValid;
        } catch (JwtException e) {
            log.error("Invalid refresh token", e);
            return false;
        }
    }

    public static class TokenValidationResult {
        private final boolean isValid;
        @Getter
        private final String message;

        public TokenValidationResult(boolean isValid, String message) {
            this.isValid = isValid;
            this.message = message;
        }

        public boolean isValid() {
            return isValid;
        }

    }
}