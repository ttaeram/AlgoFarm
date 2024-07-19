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
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;

    private String content;

    private LocalDateTime createAt;

    //컬럼추가

}
