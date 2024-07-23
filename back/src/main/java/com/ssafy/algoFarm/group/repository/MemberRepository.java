package com.ssafy.algoFarm.group.repository;

import com.ssafy.algoFarm.group.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByUserIdAndGroupId(Long userPk, Long groupId);
}
