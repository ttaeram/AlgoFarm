package com.ssafy.algoFarm.group.entity;

import com.ssafy.algoFarm.algo.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;


/**
 * 구성원 엔티티
 */
@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id;

    @ManyToOne
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "group_id")
    private Group group;

    private String nickname;

    @CreationTimestamp
    private LocalDateTime joinAt;

    private Boolean isLeader = false;

    public void setUser(User user){
        if(this.user != null){
            this.user.getMembers().remove(this);
        }
        this.user = user;
        user.getMembers().add(this);
    }

    public void setGroup(Group group){
        if(this.group != null){
            this.group.getMembers().remove(this);
        }
        this.group = group;
        group.getMembers().add(this);
    }

    public void setIsLeader(Boolean isLeader) {
        this.isLeader = isLeader;
    }

    public void setNickname(String nickname){
        this.nickname = nickname;
    }
}
