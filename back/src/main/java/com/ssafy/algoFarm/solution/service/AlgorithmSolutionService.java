package com.ssafy.algoFarm.solution.service;

import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.group.entity.Group;
import com.ssafy.algoFarm.group.entity.Member;
import com.ssafy.algoFarm.group.repository.GroupRepository;
import com.ssafy.algoFarm.solution.dto.AlgorithmSolutionDTO;
import com.ssafy.algoFarm.solution.entity.AlgorithmSolution;
import com.ssafy.algoFarm.solution.repository.AlgorithmSolutionRepository;
import com.ssafy.algoFarm.solution.util.ExperienceConverter;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
@Service
@Transactional
@Slf4j
public class AlgorithmSolutionService {

    private final AlgorithmSolutionRepository algorithmSolutionRepository;
    private final GroupRepository groupRepository;

    public AlgorithmSolutionService(AlgorithmSolutionRepository algorithmSolutionRepository, GroupRepository groupRepository) {
        this.algorithmSolutionRepository = algorithmSolutionRepository;
        this.groupRepository = groupRepository;
    }

    /**
     * 문제를 저장한 뒤 저장한 문제 정보를 반환한다.
     *
     * @param algorithmSolutionDTO user가 푼 문제정보
     * @param user 이중 확인을 위한 user 정보
     * @return AlgorithmSolutionDTO(문제 정보 / 문제id, 사용자id, 문제코드 ...)
     */

    public AlgorithmSolutionDTO saveBojSolution(AlgorithmSolutionDTO algorithmSolutionDTO, User user) {
        // 기존 데이터를 조회
        Optional<AlgorithmSolution> existingDataOpt = algorithmSolutionRepository.findByUserIdAndProblemId(
                user.getId(), algorithmSolutionDTO.getProblemId());

        AlgorithmSolution solution;
        if (existingDataOpt.isPresent()) {
            // 기존 데이터가 존재하면 업데이트
            solution = updateExistingSolution(existingDataOpt.get(), algorithmSolutionDTO);
        } else {
            // 기존 데이터가 존재하지 않으면 새로운 데이터 저장
            solution = SolutionSetData(algorithmSolutionDTO, user);
            //기존에 풀었던 문제가 아니어서 새롭게 DB에 저장하는 경우라면 그룹 경험치를 증가시킴
            updateGroupExperienceAndLevel(algorithmSolutionDTO, user);
        }

        return AlgorithmSolution.toDto(solution);
    }
    /**
     * 기존에 제출한 문제라면 문제에 대한 결과를 업데이트 해준다.
     *
     * @param existingData user가 이미 푼 문제정보(DB에 저장 되어있는 문제정보)
     * @param algorithmSolutionDTO user가 다시 제출한 문제 정보(DB에 업데이트 해줄 문제정보)
     * @return void
     */
    private AlgorithmSolution updateExistingSolution(AlgorithmSolution existingData, AlgorithmSolutionDTO algorithmSolutionDTO) {
        existingData.setCode(algorithmSolutionDTO.getCode());
        existingData.setCodeLength(algorithmSolutionDTO.getCodeLength());
        existingData.setLanguage(algorithmSolutionDTO.getLanguage());
        existingData.setMemory(algorithmSolutionDTO.getMemory());
        existingData.setResult(algorithmSolutionDTO.getResult());
        existingData.setRuntime(algorithmSolutionDTO.getRuntime());
        existingData.setScore(algorithmSolutionDTO.getScore());

        if (existingData.getProblemDescription() == null && algorithmSolutionDTO.getProblemDescription() != null) {
            existingData.setProblemDescription(algorithmSolutionDTO.getProblemDescription());
        }

        return algorithmSolutionRepository.save(existingData);
    }

    /**
     * 문제 데이터에 필요한 User 엔티티, 제출시간, 문제에 대한 경험치를 저장한다.
     *
     * @param algorithmSolutionDTO user가 푼 문제정보
     * @param user 이중 확인을 위한 user 정보
     * @return AlgorithmSolution(문제 정보 / 문제id, 사용자id, 문제코드 ...)
     */
    private AlgorithmSolution SolutionSetData(AlgorithmSolutionDTO algorithmSolutionDTO, User user) {
        AlgorithmSolution newData = AlgorithmSolution.toEntity(algorithmSolutionDTO);
        newData.setUser(user);
        newData.setSubmitTime(LocalDateTime.now());
        newData.setProblemExperience(ExperienceConverter.getExperienceByLevelName(algorithmSolutionDTO.getLevel()));

        return algorithmSolutionRepository.save(newData);
    }

    /**
     * 사용자가 소속된 그룹의 경험치를 업데이트하고, 필요시 그룹의 레벨을 증가시키는 역할을 한다.
     *
     * @param algorithmSolutionDTO user가 푼 문제정보
     * @param user 인가를 위한 user 정보
     * @return void
     */

    private void updateGroupExperienceAndLevel(AlgorithmSolutionDTO algorithmSolutionDTO,User user) {
        // 사용자(user)의 멤버십 정보에서 그룹을 찾기
        Member member = user.getMembers().get(0);
        Group group = member.getGroup();
        double currentExp = group.getMascot().getCurrentExp();
        double maxExp = group.getMascot().getMaxExp();
        double problemExp = ExperienceConverter.getExperienceByLevelName(algorithmSolutionDTO.getLevel());


        currentExp += problemExp;
        while (currentExp >= maxExp) {
            currentExp -= maxExp;
            group.getMascot().setLevel(group.getMascot().getLevel() + 1);
            maxExp += 50;
        }
        group.getMascot().setCurrentExp(currentExp);
        group.getMascot().setMaxExp(maxExp);

        // 그룹 저장소에 업데이트
        groupRepository.save(group);
    }

}