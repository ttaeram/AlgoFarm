package com.ssafy.algoFarm.solution.service;

import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.solution.dto.AlgorithmSolutionDTO;
import com.ssafy.algoFarm.solution.entity.AlgorithmSolution;
import com.ssafy.algoFarm.solution.repository.AlgorithmSolutionRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;
@Service
@Transactional
@Slf4j
public class AlgorithmSolutionService {

    private final AlgorithmSolutionRepository algorithmSolutionRepository;

    public AlgorithmSolutionService(AlgorithmSolutionRepository algorithmSolutionRepository) {
        this.algorithmSolutionRepository = algorithmSolutionRepository;
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

        if (existingDataOpt.isPresent()) {
            // 기존 데이터가 존재하면 업데이트
            AlgorithmSolution existingData = existingDataOpt.get();
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
            AlgorithmSolution updatedData = algorithmSolutionRepository.save(existingData);

            return AlgorithmSolution.toDto(updatedData);
        } else {
            // 기존 데이터가 존재하지 않으면 새로운 데이터 저장
            AlgorithmSolution newData = AlgorithmSolution.toEntity(algorithmSolutionDTO);
            AlgorithmSolution savedData = algorithmSolutionRepository.save(newData);
            return AlgorithmSolution.toDto(savedData);
        }
    }

}