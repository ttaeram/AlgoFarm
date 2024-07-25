package com.ssafy.algoFarm.solution.dto;

import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.solution.entity.AlgorithmSolution;
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
    private String title; // 문제제목
    private Long score; // 점수

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
                .user(User.builder().id(userId).build()) // User 객체를 설정하는 방법에 따라 수정
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
                .userId(entity.getUser().getId())
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
