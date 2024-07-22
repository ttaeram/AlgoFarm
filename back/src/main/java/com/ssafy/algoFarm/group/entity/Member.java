package com.ssafy.algoFarm.group.entity;

import com.ssafy.algoFarm.algo.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;


/**
 * 구성원 엔티티
 */
@Entity
@Getter
@NoArgsConstructor
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;

    private String nickname;

    @CreationTimestamp
    private LocalDateTime joinAt;

    @ColumnDefault("false")
    private Boolean isLeader;

}
