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
@Table(name = "study_group")
@NoArgsConstructor
@AllArgsConstructor
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

    //그룹 생성시 사용
    //그룹명
    @Setter
    private String name;

    private String description="";

    //초대코드
    @Setter
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

    public void countUpCurrentNum(){
        //TODO 최대 참가 인원을 초과한 경우 예외처리 해줘야함.
        this.currentNum++;
    }

    public void countDownCurrentNum(){
        this.currentNum--;
    }

}
