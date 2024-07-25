package com.ssafy.algoFarm.solution.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.solution.dto.AlgorithmSolutionDTO;
import com.ssafy.algoFarm.solution.util.StringListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "algorithm_solution", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "problem_id"})
})
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlgorithmSolution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "algorithm_solution_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    //문제제목
    private String title;

    //문제레벨
    private String level;

    //사용언어
    @Setter
    private String language;

    //실행결과
    @Setter
    private String result;

    //문제경로
    private String directory;

    //문제태그-> 태그가 하나인가? 여러개면 분리필요
    @Convert(converter = StringListConverter.class)
    private List<String> problemTags;

    //문제설명
    @Setter
    private String problemDescription;

    //문제입력
    private String problemInput;

    //문제출력
    private String problemOutput;

    @Setter
    private Long codeLength;

    //제출코드
    @Setter
    @Lob
    @Column(columnDefinition = "TEXT")
    private String code;

    //문제id
    private Long problemId;

    //백준제출id
    private Long bojId;

    //메모리사용량
    @Setter
    private Long memory;

    //실행시간
    @Setter
    private Long runtime;

    //점수
    @Setter
    private Long score;

    //제출시간
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime currentDatetTime;

    public void setUser(User user){
        if(this.user != null){
            this.user.getSolutions().remove(this);
        }
        this.user = user;
        user.getSolutions().add(this);
    }

    public static AlgorithmSolutionDTO toDto(AlgorithmSolution algorithmSolution) {
        return AlgorithmSolutionDTO.builder()
                .directory(algorithmSolution.getDirectory())
                .code(algorithmSolution.getCode())
                .codeLength(algorithmSolution.getCodeLength())
                .language(algorithmSolution.getLanguage())
                .level(algorithmSolution.getLevel())
                .memory(algorithmSolution.getMemory())
                .problemId(algorithmSolution.getProblemId())
                .problemDescription(algorithmSolution.getProblemDescription())
                .problemInput(algorithmSolution.getProblemInput())
                .problemOutput(algorithmSolution.getProblemOutput())
                .problemTags(algorithmSolution.getProblemTags())
                .result(algorithmSolution.getResult())
                .runtime(algorithmSolution.getRuntime())
                .title(algorithmSolution.getTitle())
                .score(algorithmSolution.getScore())
                .currentDateTime(algorithmSolution.getCurrentDatetTime())
                .build();
    }

    // 엔티티로 변환하는 메서드
    public static AlgorithmSolution toEntity(AlgorithmSolutionDTO algorithmSolutionDTO) {
        return AlgorithmSolution.builder()
                .directory(algorithmSolutionDTO.getDirectory())
                .code(algorithmSolutionDTO.getCode())
                .codeLength(algorithmSolutionDTO.getCodeLength())
                .language(algorithmSolutionDTO.getLanguage())
                .level(algorithmSolutionDTO.getLevel())
                .memory(algorithmSolutionDTO.getMemory())
                .problemId(algorithmSolutionDTO.getProblemId())
                .problemDescription(algorithmSolutionDTO.getProblemDescription())
                .problemInput(algorithmSolutionDTO.getProblemInput())
                .problemOutput(algorithmSolutionDTO.getProblemOutput())
                .problemTags(algorithmSolutionDTO.getProblemTags())
                .result(algorithmSolutionDTO.getResult())
                .runtime(algorithmSolutionDTO.getRuntime())
                .title(algorithmSolutionDTO.getTitle())
                .score(algorithmSolutionDTO.getScore())
                .currentDatetTime(algorithmSolutionDTO.getCurrentDateTime())
                .build();


}
}
