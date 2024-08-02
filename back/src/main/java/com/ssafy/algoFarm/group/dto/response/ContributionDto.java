package com.ssafy.algoFarm.group.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.ToString;


@Getter
@Schema(description = "구성원별 닉네임, 구성원의 기여경험치, 해당그룹의 전체 누적경험치")
@ToString
public class ContributionDto {

    @Schema(description = "그룹 내에서 사용하는 구성원의 별명")
    private String nickname;

    @Schema(description = "그룹 내에서 개인이 기여한 경험치")
    private double individualContribution;

    @Schema(description = "그룹 내 전체 누적 경험치")
    private double mascotExperience;

    public ContributionDto(String nickname, double individualContribution, double mascotExperience) {
        this.nickname = nickname;
        this.individualContribution = individualContribution;
        this.mascotExperience = mascotExperience;
    }


}
