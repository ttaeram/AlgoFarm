package com.ssafy.algoFarm.solution.repository;

import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.solution.entity.AlgorithmSolution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AlgorithmSolutionRepository extends JpaRepository<AlgorithmSolution, Long> {
    Optional<AlgorithmSolution> findByUserIdAndProblemId(Long userId, Long problemId);
}
