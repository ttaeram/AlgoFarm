package com.ssafy.algoFarm.group.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


public record ChangeNicknameReqDto (
        @Schema(description = "바꿀 닉네임")
        String newNickname,
        @Schema(description = "유저가 참가중인 그룹 id")
        Long groupId
){

}
