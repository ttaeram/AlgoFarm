package com.ssafy.algoFarm.solution.repository;

import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.solution.entity.AlgorithmSolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AlgorithmSolutionRepository extends JpaRepository<AlgorithmSolution, Long> {
    Optional<AlgorithmSolution> findByUserIdAndProblemId(Long userId, Long problemId);

    @Query(value = "SELECT DATE(s.submit_time) as date, COUNT(DISTINCT s.user_id) as commitCount " +
            "FROM algorithm_solution s " +
            "JOIN member m ON s.user_id = m.user_id " +
            "WHERE m.group_id = :groupId " +
            "GROUP BY DATE(s.submit_time)", nativeQuery = true)
    List<Object[]> findCommitCountByGroupId(@Param("groupId") Long groupId);
}
