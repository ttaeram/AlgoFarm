package com.ssafy.algoFarm.solution.repository;

import com.ssafy.algoFarm.group.dto.response.ContributionDto;
import com.ssafy.algoFarm.group.dto.response.PieceOfGrassDto;
import com.ssafy.algoFarm.solution.entity.AlgorithmSolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AlgorithmSolutionRepository extends JpaRepository<AlgorithmSolution, Long> {
    Optional<AlgorithmSolution> findByUserIdAndProblemId(Long userId, Long problemId);

    @Query("SELECT new com.ssafy.algoFarm.group.dto.response.PieceOfGrassDto(DATE(s.submitTime), COUNT(DISTINCT s.user.id)) " +
            "FROM AlgorithmSolution s " +
            "JOIN Member m ON s.user.id = m.user.id " +
            "WHERE m.group.id = :groupId " +
            "AND s.submitTime >= m.joinAt " +
            "GROUP BY DATE(s.submitTime)")
    List<PieceOfGrassDto> findCommitCountByGroupId(@Param("groupId") Long groupId);


    @Query("SELECT COALESCE(SUM(s.problemExperience), 0) " +
            "FROM AlgorithmSolution s " +
            "WHERE s.user.id = :userId AND s.submitTime >= :joinAt")
    double calculateMemberContribution(@Param("userId") Long userId, @Param("joinAt") LocalDateTime joinAt);



}
