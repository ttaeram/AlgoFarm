package com.ssafy.algoFarm.group.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record CodeResDto(
    @Schema(description = "초대코드")
    String inviteCode
) {
}
