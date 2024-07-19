package com.ssafy.algoFarm.group.repository;

import com.ssafy.algoFarm.group.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
}
