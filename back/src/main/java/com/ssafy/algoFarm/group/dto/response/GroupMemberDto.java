package com.ssafy.algoFarm.group.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Schema(description = "그룹에 포함된 유저의 정보를 포함한 DTO")
@Getter
@Setter
public class GroupMemberDto {
    private Long memberId;
    private Long userId;
    private Boolean isLeader;
    private String nickname;
}
