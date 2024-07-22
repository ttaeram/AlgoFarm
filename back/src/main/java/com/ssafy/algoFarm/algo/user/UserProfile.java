package com.ssafy.algoFarm.algo.user;

import java.util.Map;

public record UserProfile(
        String oAuthId,
        String name,
        String email,
        Map<String, Object> attributes
) {
    public UserProfile {
        attributes = (attributes != null) ? attributes : Map.of();
    }

    public Object getAttribute(String key) {
        return attributes.get(key);
    }

    public String getAttributeAsString(String key) {
        Object value = attributes.get(key);
        return (value != null) ? value.toString() : null;
    }

    public Map<String, Object> getAttributes() {
        return Map.copyOf(attributes);
    }
}