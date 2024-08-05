package com.ssafy.algoFarm.algo.auth.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
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

    /**
     * 애플리케이션 시작 시 RSA 키 쌍을 초기화합니다.
     * @throws JwtException 키 파싱 중 오류가 발생한 경우
     */
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

    /**
     * PEM 형식의 개인 키를 파싱합니다.
     * @param resource 개인 키 리소스
     * @return RSA 개인 키
     * @throws IOException 키 파일 읽기 실패 시
     * @throws NoSuchAlgorithmException RSA 알고리즘을 사용할 수 없는 경우
     * @throws InvalidKeySpecException 잘못된 키 형식
     */
    private RSAPrivateKey parsePrivateKey(Resource resource) throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
        String privateKeyPEM = readPEMContent(resource);
        byte[] encoded = Base64.getDecoder().decode(privateKeyPEM);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(encoded);
        return (RSAPrivateKey) keyFactory.generatePrivate(keySpec);
    }

    /**
     * PEM 형식의 공개 키를 파싱합니다.
     * @param resource 공개 키 리소스
     * @return RSA 공개 키
     * @throws IOException 키 파일 읽기 실패 시
     * @throws NoSuchAlgorithmException RSA 알고리즘을 사용할 수 없는 경우
     * @throws InvalidKeySpecException 잘못된 키 형식
     */
    private RSAPublicKey parsePublicKey(Resource resource) throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
        String publicKeyPEM = readPEMContent(resource);
        byte[] encoded = Base64.getDecoder().decode(publicKeyPEM);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(encoded);
        return (RSAPublicKey) keyFactory.generatePublic(keySpec);
    }

    /**
     * PEM 파일의 내용을 읽어 헤더와 푸터를 제거합니다.
     * @param resource PEM 파일 리소스
     * @return PEM 내용 (Base64 인코딩된 키)
     * @throws IOException 파일 읽기 실패 시
     */
    private String readPEMContent(Resource resource) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
            return reader.lines()
                    .filter(line -> !line.startsWith("-----BEGIN") && !line.startsWith("-----END"))
                    .collect(Collectors.joining());
        }
    }

    /**
     * JWT 토큰을 생성합니다.
     * @param email 사용자 이메일
     * @param additionalClaims 추가적인 클레임 (선택적)
     * @return 생성된 JWT 토큰
     */
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

    /**
     * JWT 토큰의 유효성을 검증합니다.
     * @param token 검증할 JWT 토큰
     * @return 토큰의 유효성 여부
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(publicKey).build().parseClaimsJws(token);
            log.debug("JWT token validated successfully");
            return true;
        } catch (SignatureException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    /**
     * JWT 토큰에서 이메일을 추출합니다.
     * @param token JWT 토큰
     * @return 토큰에서 추출한 이메일
     * @throws JwtException 토큰 파싱 중 오류 발생 시
     */
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

    /**
     * JWT 토큰에서 특정 클레임을 추출합니다.
     * @param token JWT 토큰
     * @param claimName 추출할 클레임의 이름
     * @return 추출된 클레임 값
     * @throws JwtException 토큰 파싱 중 오류 발생 시
     */
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
    /**
     * HTTP 요청에서 JWT 토큰을 추출합니다.
     * @param request HTTP 요청
     * @return 추출된 JWT 토큰, 없으면 null
     */
    public String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            log.debug("JWT token extracted from request");
            return bearerToken.substring(7);
        }
        log.debug("No JWT token found in request");
        return null;
    }
    /**
     * 토큰이 만료되었는지 확인합니다.
     * @param token JWT 토큰
     * @return 토큰 만료 여부
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expirationDate = Jwts.parserBuilder()
                    .setSigningKey(publicKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getExpiration();
            return expirationDate.before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        } catch (JwtException e) {
            log.error("Error checking token expiration", e);
            return false;
        }
    }
    /**
     * 리프레시 토큰을 생성합니다.
     * @param email 사용자 이메일
     * @return 생성된 리프레시 토큰
     */
    public String generateRefreshToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + (expirationTime * 24 * 7)); // 7일 후 만료

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(privateKey, SignatureAlgorithm.RS256)
                .compact();
    }

    /**
     * 리프레시 토큰의 유효성을 검증합니다.
     * @param token 리프레시 토큰
     * @return 토큰의 유효성 여부
     */
    public boolean validateRefreshToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(publicKey).build().parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (JwtException e) {
            log.error("Invalid refresh token", e);
            return false;
        }
    }
}