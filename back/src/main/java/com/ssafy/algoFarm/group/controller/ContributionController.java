package com.ssafy.algoFarm.group.controller;

import com.ssafy.algoFarm.group.dto.response.ContributionDto;
import com.ssafy.algoFarm.group.service.ContributionService;
import com.ssafy.global.response.DataResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin("*")
@Slf4j
public class ContributionController {
    private final ContributionService contributionService;

    public ContributionController(ContributionService contributionService) {
        this.contributionService = contributionService;
    }

    @GetMapping("/contributions/{groupId}")
    @Operation(summary = "그룹의 구성원별 캐릭터 기여도를 제공하는 api")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<DataResponse<List<ContributionDto>>> getGroupMemberContributions(@PathVariable Long groupId) {
        List<ContributionDto> contributionDtoList = contributionService.getMemberContributions(groupId);
        DataResponse<List<ContributionDto>> response = DataResponse.of(HttpStatus.OK,"해당 그룹의 구성원별 기여도", contributionDtoList);
        return ResponseEntity.ok(response);
    }

}
