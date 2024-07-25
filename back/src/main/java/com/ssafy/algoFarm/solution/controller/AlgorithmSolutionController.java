package com.ssafy.algoFarm.solution.controller;

import com.ssafy.algoFarm.algo.auth.annotation.CurrentUser;
import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.solution.dto.AlgorithmSolutionDTO;
import com.ssafy.algoFarm.solution.service.AlgorithmSolutionService;
import com.ssafy.global.response.DataResponse;
import com.ssafy.global.response.MessageResponse;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/commits")
    public ResponseEntity<MessageResponse>
    createBojSolution(@RequestBody AlgorithmSolutionDTO algorithmSolutionDTO, @Parameter(hidden = true) @CurrentUser User user) {
        try {
            AlgorithmSolutionDTO resultDTO = algorithmSolutionService.saveBojSolution(algorithmSolutionDTO, user);
            if (resultDTO == null) {
                return new ResponseEntity<>(MessageResponse.of(HttpStatus.BAD_REQUEST, "제출 형식이 틀렸습니다."), HttpStatus.BAD_REQUEST);  // Conflict 상태 코드 반환
            }
            return new ResponseEntity<>(MessageResponse.of(HttpStatus.OK, "풀었던 문제가 저장되었습니다."), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(MessageResponse.of(HttpStatus.INTERNAL_SERVER_ERROR, "내부 서버 오류가 발생했습니다."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
