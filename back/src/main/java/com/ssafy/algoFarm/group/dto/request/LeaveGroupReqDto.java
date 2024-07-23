package com.ssafy.algoFarm.group.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "그룹을 탈퇴를 요청할때 사용하는 DTO")
public record LeaveGroupReqDto(
        @Schema(description = "탈퇴할 그룹의 id", example = "1")
        Long groupId) {
}
