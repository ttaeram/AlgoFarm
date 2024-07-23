package com.ssafy.algoFarm.algo.auth;

import io.jsonwebtoken.*;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.sql.Date;
import java.time.ZonedDateTime;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.security.Keys;

import java.io.InputStream;

@Component
@Slf4j
public class JwtUtil {

    @Value("${jwt.private.key}")
    private Resource privateKeyResource;

    @Value("${jwt.public.key}")
    private Resource publicKeyResource;

    @Value("${jwt.expiration}")
    private long accessTokenExpiresIn;

    private RSAPrivateKey privateKey;
    private RSAPublicKey publicKey;

    @PostConstruct
    public void init() throws Exception {
        privateKey = parsePrivateKey(readResourceContent(privateKeyResource));
        publicKey = parsePublicKey(readResourceContent(publicKeyResource));
    }

    private String readResourceContent(Resource resource) throws Exception {
        try (InputStream inputStream = resource.getInputStream()) {
            byte[] bytes = inputStream.readAllBytes();
            return new String(bytes);
        }
    }

    private RSAPrivateKey parsePrivateKey(String key) throws Exception {
        String privateKeyContent = key
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");

        KeyFactory kf = KeyFactory.getInstance("RSA");
        PKCS8EncodedKeySpec keySpecPKCS8 = new PKCS8EncodedKeySpec(Base64.getDecoder().decode(privateKeyContent));
        return (RSAPrivateKey) kf.generatePrivate(keySpecPKCS8);
    }

    private RSAPublicKey parsePublicKey(String key) throws Exception {
        String publicKeyContent = key
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");

        KeyFactory kf = KeyFactory.getInstance("RSA");
        X509EncodedKeySpec keySpecX509 = new X509EncodedKeySpec(Base64.getDecoder().decode(publicKeyContent));
        return (RSAPublicKey) kf.generatePublic(keySpecX509);
    }

    public String generateToken(String email) {
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime tokenValidity = now.plusSeconds(accessTokenExpiresIn);

        String token = Jwts.builder()
                .setSubject(email)
                .claim("email", email)
                .setIssuedAt(Date.from(now.toInstant()))
                .setExpiration(Date.from(tokenValidity.toInstant()))
                .signWith(privateKey, SignatureAlgorithm.RS256)
                .compact();
        log.debug("Generated token: {}", token);
        return token;
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(publicKey).build().parseClaimsJws(token);
            log.info("JWT token is valid");
            return true;
        } catch (io.jsonwebtoken.security.SignatureException | MalformedJwtException e) {
            log.error("Invalid JWT signature -> Message: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("Expired JWT token -> Message: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token -> Message: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty or only contains whitespace -> Message: {}", e.getMessage());
        } catch (Exception e) {
            log.error("JWT validation error -> Message: {}", e.getMessage());
        }

        return false;
    }

    public Claims parseClaims(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(publicKey).build().parseClaimsJws(token).getBody();
        } catch (ExpiredJwtException e) {
            log.warn("JWT token is expired -> Message: {}", e.getMessage());
            return e.getClaims();
        } catch (JwtException e) {
            log.error("Failed to parse JWT token: {}", e.getMessage());
            return null;
        }
    }

    public String getEmailFromToken(String token) {
        Claims claims = parseClaims(token);
        return claims != null ? claims.get("email", String.class) : null;
    }

    public String getIdFromToken(String token) {
        Claims claims = parseClaims(token);
        return claims.get("id", String.class);
    }

    public String getRoleFromToken(String token) {
        Claims claims = parseClaims(token);
        return claims.get("role", String.class);
    }
}
