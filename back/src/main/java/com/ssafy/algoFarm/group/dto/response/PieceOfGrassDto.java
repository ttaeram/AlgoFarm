package com.ssafy.algoFarm.group.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "그룹 잔디 데이터의 하루 치 정보를 담은 DTO")
@Getter
public class PieceOfGrassDto {

    @Schema(description = "잔디 한 포기에 해당하는 날짜데이터")
    private String timestamp;

    @Schema(description = "해당 일자에 문제를 푼 그룹원의 수")
    private int commitCount;

    @Schema(description = "잔디 한 포기에 대한 주차별 정보")
    private int x;

    @Schema(description = "잔디 한 포기에 대한 요일별 정보")
    private int y;

}
