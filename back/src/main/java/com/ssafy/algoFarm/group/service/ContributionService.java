package com.ssafy.algoFarm.group.service;

import com.ssafy.algoFarm.exception.BusinessException;
import com.ssafy.algoFarm.exception.ErrorCode;
import com.ssafy.algoFarm.group.dto.response.ContributionDto;
import com.ssafy.algoFarm.group.repository.GroupRepository;
import com.ssafy.algoFarm.solution.repository.AlgorithmSolutionRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ContributionService {

    private final GroupRepository groupRepository;

    private final AlgorithmSolutionRepository algorithmSolutionRepository;


    public ContributionService(GroupRepository groupRepository, AlgorithmSolutionRepository algorithmSolutionRepository) {
        this.groupRepository = groupRepository;
        this.algorithmSolutionRepository = algorithmSolutionRepository;
    }


    /**
     * 특정 그룹의 멤버별 경험치 기여도를 계산하여 반환합니다.
     * @param groupId 그룹 ID
     * @return List<ContributionDto> 멤버별 기여도 dto(멤버 닉네임, 개별 누적 경험치, 그룹 누적 경험치 ) 리스트
     */
    public List<ContributionDto> getMemberContributions(Long groupId) {
        // 그룹 조회
        groupRepository.findById(groupId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GROUP_NOT_FOUND));

        // 한 번의 쿼리로 모든 멤버의 기여도를 가져옴
        List<Object[]> contributions = algorithmSolutionRepository.findMemberContributionsByGroupId(groupId);

        // 모든 멤버들의 총 기여도를 합산하여 mascotExperience로 사용
        int totalMascotExperience = contributions.stream()
                .mapToInt(result -> ((Number) result[2]).intValue())
                .sum();

        // 결과를 ContributionDto 리스트로 변환
        return contributions.stream()
                .map(result -> new ContributionDto(
                        (String) result[1], // nickname
                        ((Number) result[2]).intValue(), // total_experience
                        totalMascotExperience // mascotExperience로 그룹 전체의 총 경험치를 사용
                ))
                .collect(Collectors.toList());
    }
}
