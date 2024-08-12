package com.ssafy.algoFarm.mascot.repository;

import com.ssafy.algoFarm.mascot.entity.Mascot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MascotRepository extends JpaRepository<Mascot,Long>{
    public Optional<Mascot> getMascotByGroupId(Long groupId);
}
