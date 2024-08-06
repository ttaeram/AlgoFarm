package com.ssafy.algoFarm.group.service;

import com.ssafy.algoFarm.exception.BusinessException;
import com.ssafy.algoFarm.exception.ErrorCode;
import com.ssafy.algoFarm.group.dto.response.ContributionDto;
import com.ssafy.algoFarm.group.repository.GroupRepository;
import com.ssafy.algoFarm.solution.repository.AlgorithmSolutionRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class ContributionService {

    private final GroupRepository groupRepository;
    private final AlgorithmSolutionRepository algorithmSolutionRepository;


    public ContributionService(GroupRepository groupRepository, AlgorithmSolutionRepository algorithmSolutionRepository) {
        this.groupRepository = groupRepository;
        this.algorithmSolutionRepository = algorithmSolutionRepository;
    }


    /**
     * 특정 그룹의 멤버별 경험치 기여도를 계산하여 반환합니다.
     *
     * @param groupId 그룹 ID
     * @return List<ContributionDto> 멤버별 기여도 dto(멤버 닉네임, 개별 누적 경험치, 그룹 누적 경험치 ) 리스트
     */
    public List<ContributionDto> getMemberContributions(Long groupId) {
        // 그룹 조회
        groupRepository.findById(groupId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GROUP_NOT_FOUND));

        // 한 번의 쿼리로 모든 멤버의 기여도를 가져옴
        List<ContributionDto> contributions = algorithmSolutionRepository.findMemberContributionsByGroupId(groupId);
        return contributions;
    }
}