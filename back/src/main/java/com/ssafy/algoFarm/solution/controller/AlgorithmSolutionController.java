package com.ssafy.algoFarm.solution.controller;

import com.ssafy.algoFarm.solution.dto.AlgorithmSolutionDTO;
import com.ssafy.algoFarm.solution.service.AlgorithmSolutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class AlgorithmSolutionController {
    private final AlgorithmSolutionService algorithmSolutionService;

    @Autowired
    public AlgorithmSolutionController(AlgorithmSolutionService algorithmSolutionService) {
        this.algorithmSolutionService = algorithmSolutionService;
    }

    @GetMapping("/ss")
    public ResponseEntity<String> createBojData2() {
        return ResponseEntity.ok("savedBojData");
    }


    @PostMapping("/commits")
    public ResponseEntity<AlgorithmSolutionDTO> createBojData(@RequestBody AlgorithmSolutionDTO algorithmSolutionDTO) {
        try {
            AlgorithmSolutionDTO resultDTO = algorithmSolutionService.saveBojData(algorithmSolutionDTO);
            if (resultDTO == null) {
                return ResponseEntity.status(409).body(null);  // Conflict 상태 코드 반환
            }
            return ResponseEntity.ok(resultDTO);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null); // 내부 서버 오류 응답
        }
    }
}
