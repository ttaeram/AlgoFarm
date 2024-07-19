package com.ssafy.algoFarm.solution.entity;

import com.ssafy.algoFarm.algo.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
public class AlgorithmSolution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int AlgorithmSolutionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id")
    private User users;

    //문제제목
    private String problemTitle;

    //문제레벨
    private String problemLevel;

    //사용언어
    private String language;

    //실행결과
    private String result;

    //문제경로
    private String problemDirectory;

    //문제태그-> 태그가 하나인가? 여러개면 분리필요
    private String problemTags;

    //문제설명
    private String problemDescription;

    //문제입력
    private String problemInput;

    //문제출력
    private String problemOutput;

    //제출코드
    private String code;

    //문제id
    private Long problemId;

    //백준제출id
    private Long bojId;

    //메모리사용량
    private Long memory;

    //실행시간
    private Long runtime;

    //점수
    private Long bojScore;

    //제출시간
    private LocalDateTime dateTime;


}
