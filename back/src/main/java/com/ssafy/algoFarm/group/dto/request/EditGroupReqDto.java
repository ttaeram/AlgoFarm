package com.ssafy.algoFarm.group.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

public record EditGroupReqDto(
        @Schema(description = "그룹 고유 id")
        Long groupId,
        @Schema(description = "변경할 그룹명")
        String newGroupName
) {
}
