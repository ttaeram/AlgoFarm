package org.example.algo.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByoAuthId(String oAuthId);  // 'O'를 소문자 'o'로 변경

    Optional<User> findByEmail(String email);
}