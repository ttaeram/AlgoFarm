package com.ssafy.algoFarm.group.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.sql.Date;

@Schema(description = "그룹 잔디 데이터의 하루 치 정보를 담은 DTO")
@Getter
@ToString
public class PieceOfGrassDto {

    @Schema(description = "잔디 한 포기에 해당하는 날짜데이터")
    private final Date submitTime;

    @Schema(description = "해당 일자에 문제를 푼 그룹원의 수")
    private final Long commitCount;

    @Schema(description = "잔디 한 포기에 대한 주차별 정보")
    @Setter
    private int x;

    @Schema(description = "잔디 한 포기에 대한 요일별 정보")
    @Setter
    private int y;

    public PieceOfGrassDto(Date submitTime, Long commitCount) {
        this.submitTime = submitTime;  // 또는 적절한 형식으로 변환
        this.commitCount = commitCount;
    }

}