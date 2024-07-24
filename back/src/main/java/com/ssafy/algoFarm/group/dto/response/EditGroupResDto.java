package com.ssafy.algoFarm.group.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record EditGroupResDto(
        @Schema(description = "그룹 고유 id")
        Long groupId,
        @Schema(description = "변경 전 이름")
        String originName,
        @Schema(description = "변경 된 이름")
        String newName
) {
}
