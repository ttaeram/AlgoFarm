package com.ssafy.algoFarm.chat.entity;

import com.ssafy.algoFarm.group.entity.Group;
import com.ssafy.algoFarm.algo.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;

    private String content;

    private LocalDateTime createAt;

    private String nickname;

    //연관관계 편의 메서드
    public void setUser(User user) {
        //기존 user와의 관계를 제거한다.
        if(this.user != null){
            this.user.getMessages().remove(this);
        }
        this.user = user;
        user.getMessages().add(this);
    }

    public void setGroup(Group group) {
        //기존 그룹과의 관계를 제거한다.
        if(this.group != null){
            this.group.getMessages().remove(this);
        }
        this.group = group;
        group.getMessages().add(this);
    }

}
