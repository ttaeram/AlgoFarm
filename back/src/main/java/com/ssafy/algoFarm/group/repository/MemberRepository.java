package com.ssafy.algoFarm.group.repository;

import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.group.entity.Group;
import com.ssafy.algoFarm.group.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByUserIdAndGroupId(Long userPk, Long groupId);
    Page<Member> findByUserEmail(String email, Pageable pageable);
    long countByUserEmail(String email);
    boolean existsByUserAndGroup(User user, Group group);
    boolean existsByUserId(Long id);

    @Query("SELECT m.group.id FROM Member m WHERE m.user = :user")
    List<Long> findGroupIdsByUser(@Param("user") User user);
}
