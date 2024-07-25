package com.ssafy.algoFarm.solution.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ssafy.algoFarm.algo.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AlgorithmSolutionDTO {
    private Long id; //auto id
    private Long userId; // 유저ID
    private String directory;
    private String code; // 제출 코드
    private Long codeLength; // 코드길이
    private String language; // 사용 언어
    private String level; // 문제난이도
    private Long memory; // 코드메모리
    private Long problemId; // 문제ID
    private String problemDescription; // 문제 설명
    private String problemInput; // 문제 입력
    private String problemOutput; // 문제 출력
    private List<String> problemTags; // ["문제 태그1", "문제 태그2"]
    private String result; // 실행결과
    private Long runtime; // 실행 시간
//    private Long submissionId; // 백준제출ID
    private String title; // 문제제목
    private Long score; // 점수

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime currentDateTime;
}
