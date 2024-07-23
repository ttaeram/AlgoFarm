package com.ssafy.algoFarm.group.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "그룹 참가 요청을 수행하고 결과를 반환할 DTO")
public record JoinGroupResDto(
        @Schema(description = "그룹의 고유한 groupId",example = "1")
        Long groupId,
        @Schema(description = "그룹명", example = "302Found")
        String name) {
}
