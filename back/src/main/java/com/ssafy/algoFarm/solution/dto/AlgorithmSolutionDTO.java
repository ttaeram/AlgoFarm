package com.ssafy.algoFarm.solution.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.solution.entity.AlgorithmSolution;
import com.ssafy.algoFarm.solution.util.StringListDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@Schema(description = "풀었던 백준 문제 정보를 받기 위한 DTO")
public class AlgorithmSolutionDTO {
    @Schema(description = "문제고유Id", example = "0")
    private Long id; //auto id

    @Schema(description = "문제에 대한 카테고리", example = "백준/Bronze/1000.A+B")
    private String directory;

    @Schema(description = "사용자의 제출코드", example = "import java.util.Scanner...")
    private String code; // 제출 코드

    @Schema(description = "코드길이", example = "286")
    private Long codeLength; // 코드길이

    @Schema(description = "사용 언어", example = "Java 8")
    private String language; // 사용 언어

    @Schema(description = "문제난이도", example = "Bronze V")
    private String level; // 문제난이도

    @Schema(description = "코드메모리", example = "12800")
    private Long memory; // 코드메모리

    @Schema(description = "문제ID", example = "1000")
    private Long problemId; // 문제ID

    @Schema(description = "문제 정보", example = "<p>두 정수 A와 B를 입력받은 다음, A+B를..")
    private String problemDescription; // 문제 설명

    @Schema(description = "문제 입력", example = "<p>첫째 줄에 A와 B가 주어진다...")
    private String problemInput; // 문제 입력

    @Schema(description = "문제 출력", example = "<p>첫째 줄에 A+B를 출력한다.</p>")
    private String problemOutput; // 문제 출력

    @Schema(description = "문제정보 관련 태그", example = "[\"구현\", \"사칙연산\", \"수학\"]")
    //@JsonDeserialize(using = StringListDeserializer.class)
    private List<String> problemTags; // ["문제 태그1", "문제 태그2"]

    @Schema(description = "실행 결과", example = "맞았습니다!!")
    private String result; // 실행결과

    @Schema(description = "실행 시간", example = "108")
    private Long runtime; // 실행 시간

    @Schema(description = "문제 제목", example = "A+B")
    private String title; // 문제제목

    @Schema(description = "문제 점수", example = "70")
    private Long score; // 점수

    @Schema(description = "제출시각", example = "2024-07-25 16:55:30")
    private String currentDateTime; // String 형태로 LocalDateTime 받기

    // 엔티티로 변환하는 메서드
    public AlgorithmSolution toEntity() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        LocalDateTime dateTime;
        try {
            dateTime = LocalDateTime.parse(currentDateTime, formatter);
        } catch (DateTimeParseException e) {
            System.err.println("Invalid date format: " + currentDateTime);
            e.printStackTrace();
            dateTime = LocalDateTime.now(); // 기본값을 현재 시간으로 설정 (필요시 수정)
        }
        return AlgorithmSolution.builder()
                .id(id)
                .directory(directory)
                .code(code)
                .codeLength(codeLength)
                .language(language)
                .level(level)
                .memory(memory)
                .problemId(problemId)
                .problemDescription(problemDescription)
                .problemInput(problemInput)
                .problemOutput(problemOutput)
                .problemTags(problemTags)
                .result(result)
                .runtime(runtime)
                .title(title)
                .score(score)
                .currentDatetTime(dateTime)
                .build();
    }

    // 엔티티에서 DTO로 변환하는 메서드
    public static AlgorithmSolutionDTO fromEntity(AlgorithmSolution entity) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return AlgorithmSolutionDTO.builder()
                .id(entity.getId())
                .directory(entity.getDirectory())
                .code(entity.getCode())
                .codeLength(entity.getCodeLength())
                .language(entity.getLanguage())
                .level(entity.getLevel())
                .memory(entity.getMemory())
                .problemId(entity.getProblemId())
                .problemDescription(entity.getProblemDescription())
                .problemInput(entity.getProblemInput())
                .problemOutput(entity.getProblemOutput())
                .problemTags(entity.getProblemTags())
                .result(entity.getResult())
                .runtime(entity.getRuntime())
                .title(entity.getTitle())
                .score(entity.getScore())
                .currentDateTime(entity.getCurrentDatetTime().format(formatter))
                .build();
    }
}
