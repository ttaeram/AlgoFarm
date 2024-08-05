package com.ssafy.algoFarm.group.controller;

import com.ssafy.algoFarm.group.dto.response.PieceOfGrassDto;
import com.ssafy.algoFarm.group.service.GrassDataService;
import com.ssafy.global.response.DataResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grassData")
@CrossOrigin("*")
@Slf4j
public class GrassDataController {
    private final GrassDataService grassDataService;

    public GrassDataController(GrassDataService grassDataService) {
        this.grassDataService = grassDataService;
    }

    @GetMapping("/{groupId}")
    @Operation(summary = "그룹별 잔디 리스트를 제공하는 api")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DataResponse<List<PieceOfGrassDto>>> getGrassDataByGroupId(@PathVariable Long groupId){
        List<PieceOfGrassDto> grassData = grassDataService.getAllGrassData(groupId);
        DataResponse<List<PieceOfGrassDto>> response = DataResponse.of(HttpStatus.OK, "그룹별 잔디 리스트", grassData);
        return ResponseEntity.ok(response);
    }


}