package com.ssafy.algoFarm.solution.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.solution.dto.AlgorithmSolutionDTO;
import com.ssafy.algoFarm.solution.util.StringListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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

    private String title;
    private String level;

    @Setter
    private double problemExperience;

    @Setter
    private String language;

    @Setter
    private String result;
    private String directory;

    @Convert(converter = StringListConverter.class)
    private List<String> problemTags;

    @Setter
    private String problemDescription;
    private String problemInput;
    private String problemOutput;

    @Setter
    private Long codeLength;

    @Setter
    @Lob
    @Column(columnDefinition = "TEXT")
    private String code;

    private Long problemId;
    private Long bojId;

    @Setter
    private Long memory;

    @Setter
    private Long runtime;

    @Setter
    private Long score;

    @Setter
    private LocalDateTime submitTime;

    public void setUser(User user){
        if(this.user != null){
            this.user.getSolutions().remove(this);
        }
        this.user = user;
        user.getSolutions().add(this);
    }

    public static AlgorithmSolutionDTO toDto(AlgorithmSolution algorithmSolution) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return AlgorithmSolutionDTO.builder()
                .id(algorithmSolution.getId())
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
                .build();
    }

    public static AlgorithmSolution toEntity(AlgorithmSolutionDTO algorithmSolutionDTO) {
        return AlgorithmSolution.builder()
                .id(algorithmSolutionDTO.getId())
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
                .build();
    }
}
