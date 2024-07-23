package com.ssafy.algoFarm.group.entity;

import com.ssafy.algoFarm.chat.entity.ChatMessage;
import com.ssafy.algoFarm.mascot.entity.Mascot;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "study_group")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name="mascot_id")
    private Mascot mascot;

    @CreationTimestamp
    private LocalDateTime createdAt;

    //현재 참가 인원
    private Integer currentNum = 0;

    //최대 참가 인원
    private Integer MaxNum = 10;

    //그룹명
    private String name;

    private String description="";

    //초대코드
    private String code;

    //현재 경험치
    @ColumnDefault("0")
    private Long currentExp = 0L;

    //최대 경험치 -> 현재경험치가 최대 경험치가 되면 레벨업한다.
    @ColumnDefault("100")
    private Long maxExp = 100L;

    @ColumnDefault("1")
    private Integer level = 1;

    @OneToMany(mappedBy = "group",cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();

    @OneToMany(mappedBy = "group",cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Member> members = new ArrayList<>();

    public void setMascot(Mascot mascot){
        if(this.mascot != null){
            this.mascot.getGroups().remove(this);
        }
        this.mascot = mascot;
        mascot.getGroups().add(this);
    }

    //그룹 생성시 사용
    public void setName(String name){
        this.name = name;
    }

    public void countUpCurrentNum(){
        //TODO 최대 참가 인원을 초과한 경우 예외처리 해줘야함.
        this.currentNum++;
    }

    public void countDownCurrentNum(){
        this.currentNum--;
    }

    public void setCode(String code){
        this.code = code;
    }


    @Value
    @Builder(builderClassName = "TestBuilder", buildMethodName = "buildTestGroup")
    public static class TestGroup {
        Long id;
        String name;
        String code;
        Mascot mascot;
        @Builder.Default Integer currentNum = 0;
        @Builder.Default Integer maxNum = 10;
        @Builder.Default String description = "";
        @Builder.Default Long currentExp = 0L;
        @Builder.Default Long maxExp = 100L;
        @Builder.Default Integer level = 1;

        public static class TestBuilder {
            public Group build() {
                TestGroup testGroup = buildTestGroup();
                Group group = Group.builder()
                        .id(testGroup.id)
                        .name(testGroup.name)
                        .code(testGroup.code)
                        .mascot(testGroup.mascot)
                        .currentNum(testGroup.currentNum)
                        .MaxNum(testGroup.maxNum)
                        .description(testGroup.description)
                        .currentExp(testGroup.currentExp)
                        .maxExp(testGroup.maxExp)
                        .level(testGroup.level)
                        .build();
                return group;
            }
        }
    }

    public static TestGroup.TestBuilder testBuilder() {
        return TestGroup.builder();
    }
}
