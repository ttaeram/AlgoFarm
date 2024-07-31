package com.ssafy.algoFarm.group.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "그룹 페이지에 참가했을 때, 필요한 데이터를 반환하는 API ")
public record GroupInfoDto(
        @Schema(description = "group고유id")
        Long groupId,

        @Schema(description = "그룹 이름")
        String name,

        @Schema(description = "그룹 설명")
        String description,

        @Schema(description = "현재 경험치")
        Long currentExp,

        @Schema(description = "최대 경험치")
        Long maxExp,

        @Schema(description = "캐릭터 레벨")
        Integer level,

        @Schema(description = "그룹장 여부")
        Boolean isLeader

) {
}
