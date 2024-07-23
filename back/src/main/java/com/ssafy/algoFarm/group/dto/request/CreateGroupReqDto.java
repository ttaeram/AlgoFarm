package com.ssafy.algoFarm.group.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;


@Schema(description = "새로운 그룹을 생성하기 위한 DTO")
public record CreateGroupReqDto(
        @Schema(description = "생성할 그룹명",example = "302Found")
        String groupName) {
}
