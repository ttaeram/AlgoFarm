package com.ssafy.algoFarm.group.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "그룹 생성 요청을 수행하고 정보를 반환할 DTO")
public record CreateGroupResDto(
        @Schema(description = "그룹의 고유한 groupId",example = "1")
        Long groupId,
        @Schema(description = "그룹명", example = "302Found")
        String groupName,
        @Schema(description = "초대코드")
        String inviteCode){
}
