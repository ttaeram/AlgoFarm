package com.ssafy.algoFarm.group.entity;

import com.ssafy.algoFarm.chat.entity.Message;
import com.ssafy.algoFarm.mascot.entity.Mascot;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long groupId;

    @ManyToOne
    @JoinColumn(name="moscot_id")
    private Mascot mascot;

    @CreationTimestamp
    private LocalDateTime creatAt;

    //현재 참가 인원
    @ColumnDefault("0")
    private Integer currentNum;

    //최대 참가 인원
    @ColumnDefault("10")
    private Integer MaxNum;

    //그룹명
    private String name;

    private String description;

    //초대코드
    private String code;

    //현재 경험치
    @ColumnDefault("0")
    private Long currentExp;

    //최대 경험치 -> 현재경험치가 최대 경험치가 되면 레벨업한다.
    @ColumnDefault("100")
    private Long maxExp;

    @ColumnDefault("1")
    private Integer level;

    @OneToMany(mappedBy = "group")
    private List<Message> messages;

    @OneToMany(mappedBy = "group")
    private List<Member> members;
}
