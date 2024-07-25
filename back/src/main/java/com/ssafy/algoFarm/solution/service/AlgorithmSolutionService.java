package com.ssafy.algoFarm.solution.service;

import com.ssafy.algoFarm.solution.dto.AlgorithmSolutionDTO;
import com.ssafy.algoFarm.solution.entity.AlgorithmSolution;
import com.ssafy.algoFarm.solution.repository.AlgorithmSolutionRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AlgorithmSolutionService {

    private final AlgorithmSolutionRepository algorithmSolutionRepository;

    public AlgorithmSolutionService(AlgorithmSolutionRepository algorithmSolutionRepository) {
        this.algorithmSolutionRepository = algorithmSolutionRepository;
    }


    public AlgorithmSolutionDTO saveBojData(AlgorithmSolutionDTO algorithmSolutionDTO) {
        // 기존 데이터를 조회
        Optional<AlgorithmSolution> existingDataOpt = algorithmSolutionRepository.findByUserIdAndProblemId(
                algorithmSolutionDTO.getUserId(), algorithmSolutionDTO.getProblemId());

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