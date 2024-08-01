package com.ssafy.algoFarm.solution.service;

import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.group.entity.Group;
import com.ssafy.algoFarm.group.entity.Member;
import com.ssafy.algoFarm.group.repository.GroupRepository;
import com.ssafy.algoFarm.mascot.entity.Mascot;
import com.ssafy.algoFarm.solution.dto.AlgorithmSolutionDTO;
import com.ssafy.algoFarm.solution.entity.AlgorithmSolution;
import com.ssafy.algoFarm.solution.repository.AlgorithmSolutionRepository;
import com.ssafy.algoFarm.solution.util.ExperienceConverter;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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

    public AlgorithmSolutionDTO saveBojSolution(AlgorithmSolutionDTO algorithmSolutionDTO, User user) {
        Optional<AlgorithmSolution> existingDataOpt = algorithmSolutionRepository.findByUserIdAndProblemId(
                user.getId(), algorithmSolutionDTO.getProblemId());

        if (existingDataOpt.isPresent()) {
            AlgorithmSolution existingData = existingDataOpt.get();
            updateExistingSolution(existingData, algorithmSolutionDTO);
            AlgorithmSolution updatedData = algorithmSolutionRepository.save(existingData);
            return AlgorithmSolution.toDto(updatedData);
        } else {
            AlgorithmSolution newData = AlgorithmSolution.toEntity(algorithmSolutionDTO);
            newData.setUser(user);
            AlgorithmSolution savedData = algorithmSolutionRepository.save(newData);
            updateMascotExperienceAndLevel(algorithmSolutionDTO, user);
            return AlgorithmSolution.toDto(savedData);
        }
    }

    private void updateExistingSolution(AlgorithmSolution existingData, AlgorithmSolutionDTO algorithmSolutionDTO) {
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
    }

    private void updateMascotExperienceAndLevel(AlgorithmSolutionDTO algorithmSolutionDTO, User user) {
        Member member = user.getMembers().get(0);
        Group group = member.getGroup();
        Mascot mascot = group.getMascot();

        Long currentExp = mascot.getCurrentExp();
        Long maxExp = mascot.getMaxExp();
        int problemExp = ExperienceConverter.convertLevelToExperience(algorithmSolutionDTO.getLevel());

        currentExp += problemExp;
        while (currentExp >= maxExp) {
            currentExp -= maxExp;
            mascot.setLevel(mascot.getLevel() + 1);
            maxExp += 50;
        }

        mascot.setCurrentExp(currentExp);
        mascot.setMaxExp(maxExp);

        groupRepository.save(group);
    }
}