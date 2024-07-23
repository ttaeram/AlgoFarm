package com.ssafy.algoFarm.group.repository;

import com.ssafy.algoFarm.group.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {
    Optional<Group> findByCode(String code);
}
