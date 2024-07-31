package com.ssafy.algoFarm.group.controller;

import com.ssafy.algoFarm.algo.auth.annotation.CurrentUser;
import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.group.dto.response.PieceOfGrassDto;
import com.ssafy.algoFarm.group.service.GrassDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grassData")
@CrossOrigin
public class GrassDataController {
    @Autowired
    private GrassDataService grassDataService;

    @GetMapping("/{groupId}")
    @Operation(summary = "그룹별 잔디 리스트를 제공하는 api")
    @SecurityRequirement(name = "bearerAuth")
    public List<PieceOfGrassDto> getGrassDataByGroupId(@PathVariable Long groupId){
        return grassDataService.getAllGrassData(groupId);
    }


}
