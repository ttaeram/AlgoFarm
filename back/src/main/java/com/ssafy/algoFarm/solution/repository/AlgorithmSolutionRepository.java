package com.ssafy.algoFarm.solution.repository;

import com.ssafy.algoFarm.group.dto.response.ContributionDto;
import com.ssafy.algoFarm.group.dto.response.PieceOfGrassDto;
import com.ssafy.algoFarm.solution.entity.AlgorithmSolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AlgorithmSolutionRepository extends JpaRepository<AlgorithmSolution, Long> {
    Optional<AlgorithmSolution> findByUserIdAndProblemId(Long userId, Long problemId);

    @Query("SELECT new com.ssafy.algoFarm.group.dto.response.PieceOfGrassDto(DATE(s.submitTime), COUNT(DISTINCT s.user.id)) " +
            "FROM AlgorithmSolution s " +
            "JOIN Member m ON s.user.id = m.user.id " +
            "WHERE m.group.id = :groupId " +
            "GROUP BY DATE(s.submitTime)")
    List<PieceOfGrassDto> findCommitCountByGroupId(@Param("groupId") Long groupId);

    @Query("SELECT new com.ssafy.algoFarm.group.dto.response.ContributionDto(" +
            "m.nickname, " +
            "SUM(s.problemExperience), " +
            "(SELECT SUM(s2.problemExperience) FROM AlgorithmSolution s2 " +
            "JOIN Member m2 ON s2.user = m2.user " +
            "WHERE m2.group.id = :groupId)) " +
            "FROM AlgorithmSolution s " +
            "JOIN Member m ON s.user = m.user " +
            "WHERE m.group.id = :groupId " +
            "AND s.submitTime >= m.joinAt " +
            "GROUP BY m.nickname")
    List<ContributionDto> findMemberContributionsByGroupId(@Param("groupId") Long groupId);


}
