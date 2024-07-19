package com.ssafy.algoFarm.group.repository;

import com.ssafy.algoFarm.group.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<Group, Long> {
}
