package com.ssafy.algoFarm.algo.auth.model;

import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.core.OAuth2AccessToken;

import java.util.Map;

public class OAuth2UserRequest {
    private final ClientRegistration clientRegistration;
    private final OAuth2AccessToken accessToken;
    private final Map<String, Object> additionalParameters;
    public OAuth2UserRequest(ClientRegistration clientRegistration, OAuth2AccessToken accessToken, Map<String, Object> additionalParameters) {
        this.clientRegistration = clientRegistration;
        this.accessToken = accessToken;
        this.additionalParameters = additionalParameters;
    }
}
