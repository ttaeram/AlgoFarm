package com.ssafy.jwt;

import com.ssafy.algoFarm.algo.auth.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class JwtUtilTest {

    @Autowired
    private JwtUtil jwtUtil;

    private static final String TEST_EMAIL = "test@example.com";

    @BeforeEach
    public void setUp() {
        // 테스트를 위해 만료 시간을 5초로 설정
        ReflectionTestUtils.setField(jwtUtil, "expirationTime", 5000L);
    }

    @Test
    public void testGenerateAndValidateToken() {
        String token = jwtUtil.generateToken(TEST_EMAIL, new HashMap<>());
        assertNotNull(token);

        JwtUtil.TokenValidationResult result = jwtUtil.validateToken(token);
        assertTrue(result.isValid());
        assertEquals("Token is valid", result.message());

        String email = jwtUtil.getEmailFromToken(token);
        assertEquals(TEST_EMAIL, email);
    }

    @Test
    public void testExpiredToken() throws InterruptedException {
        String token = jwtUtil.generateToken(TEST_EMAIL, new HashMap<>());
        assertNotNull(token);

        // 토큰이 만료될 때까지 대기
        Thread.sleep(6000);

        JwtUtil.TokenValidationResult result = jwtUtil.validateToken(token);
        assertFalse(result.isValid());
        assertEquals("Token is expired", result.message());

        // 만료된 토큰에서도 이메일을 추출할 수 있는지 확인
        String email = jwtUtil.getEmailFromToken(token);
        assertEquals(TEST_EMAIL, email);
    }

    @Test
    public void testInvalidToken() {
        String invalidToken = "invalidToken";
        JwtUtil.TokenValidationResult result = jwtUtil.validateToken(invalidToken);
        assertFalse(result.isValid());
        assertNotEquals("Token is valid", result.message());
    }

    @Test
    public void testTokenWithAdditionalClaims() {
        Map<String, Object> additionalClaims = new HashMap<>();
        additionalClaims.put("role", "ADMIN");
        additionalClaims.put("userId", "12345");

        String token = jwtUtil.generateToken(TEST_EMAIL, additionalClaims);
        assertNotNull(token);

        JwtUtil.TokenValidationResult result = jwtUtil.validateToken(token);
        assertTrue(result.isValid());

        String email = jwtUtil.getEmailFromToken(token);
        assertEquals(TEST_EMAIL, email);
    }

    @Test
    public void testExtractTokenFromRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        String token = jwtUtil.generateToken(TEST_EMAIL, new HashMap<>());
        request.addHeader("Authorization", "Bearer " + token);

        String extractedToken = jwtUtil.extractTokenFromRequest(request);
        assertNotNull(extractedToken);
        assertEquals(token, extractedToken);
    }

    @Test
    public void testExtractTokenFromRequestWithoutBearer() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "InvalidHeader");

        String extractedToken = jwtUtil.extractTokenFromRequest(request);
        assertNull(extractedToken);
    }

    @Test
    public void testExtractTokenFromRequestWithNoAuthHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();

        String extractedToken = jwtUtil.extractTokenFromRequest(request);
        assertNull(extractedToken);
    }
}