package org.example.algo.user;

public record UserProfile(String oAuthId, String name, String email) {
    // 레코드를 사용하여 불변 데이터 객체를 생성합니다.
    // 생성자, getter, equals, hashCode, toString 메서드가 자동으로 생성됩니다.
}
