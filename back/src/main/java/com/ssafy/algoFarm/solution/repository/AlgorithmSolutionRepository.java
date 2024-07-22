package com.ssafy.algoFarm.solution.repository;

import com.ssafy.algoFarm.solution.entity.AlgorithmSolution;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlgorithmSolutionRepository extends JpaRepository<AlgorithmSolution, Long> {
}
