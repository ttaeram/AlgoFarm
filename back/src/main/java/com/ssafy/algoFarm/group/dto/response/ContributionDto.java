package com.ssafy.algoFarm.group.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
@Schema(description = "구성원별 닉네임, 구성원의 기여경험치, 해당그룹의 전체 누적경험치")
public class ContributionDto {

    @Schema(description = "그룹 내에서 사용하는 구성원의 별명")
    private String nickname;

    @Schema(description = "그룹 내에서 개인이 기여한 경험치")
    private int individualContribution;

    @Schema(description = "그룹 내 전체 누적 경험치")
    private int mascotExperience;
}
