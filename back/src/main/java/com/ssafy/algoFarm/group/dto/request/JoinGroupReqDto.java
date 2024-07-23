package com.ssafy.algoFarm.group.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "그룹에 참가할때 사용하는 DTO")
public record JoinGroupReqDto(
        @Schema(description = "그룹에 참가할 수 있는 초대코드")
        String inviteCode) {
}
