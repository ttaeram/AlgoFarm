package com.ssafy.algoFarm.group.service;

import com.ssafy.algoFarm.exception.BusinessException;
import com.ssafy.algoFarm.exception.ErrorCode;
import com.ssafy.algoFarm.group.dto.response.ContributionDto;
import com.ssafy.algoFarm.group.entity.Member;
import com.ssafy.algoFarm.group.repository.GroupRepository;
import com.ssafy.algoFarm.group.repository.MemberRepository;
import com.ssafy.algoFarm.solution.repository.AlgorithmSolutionRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class ContributionService {

    private final GroupRepository groupRepository;
    private final AlgorithmSolutionRepository algorithmSolutionRepository;
    private final MemberRepository memberRepository;

    public ContributionService(GroupRepository groupRepository, AlgorithmSolutionRepository algorithmSolutionRepository, MemberRepository memberRepository) {
        this.groupRepository = groupRepository;
        this.algorithmSolutionRepository = algorithmSolutionRepository;
        this.memberRepository = memberRepository;
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

        List<Member> memberList = memberRepository.findAllByGroupId(groupId);

        List<ContributionDto> contributions = new ArrayList<>();
        System.out.println("contributions 는 "+ contributions);
        log.info("contributions = {}",contributions);
        for (Member member : memberList) {
            // 각 멤버의 개별 기여도 계산
            double individualContribution = algorithmSolutionRepository.calculateMemberContribution(
                    member.getUser().getId(), member.getJoinAt());
            System.out.println( "individualContribution ======================>"+ individualContribution);

            // ContributionDto 생성 및 추가
            contributions.add(new ContributionDto(member.getNickname(), individualContribution, 0));
        }

        // 전체 기여도 (mascotExperience) 계산
        double mascotExperience = contributions.stream()
                .mapToDouble(ContributionDto::getIndividualContribution)
                .sum();

        // 모든 멤버의 mascotExperience를 동일한 값으로 설정
        contributions.forEach(contribution -> contribution.setMascotExperience(mascotExperience));

        return contributions;
    }
}