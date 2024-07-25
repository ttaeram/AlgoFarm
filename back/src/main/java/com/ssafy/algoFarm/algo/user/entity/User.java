package com.ssafy.algoFarm.algo.user.entity;

import com.ssafy.algoFarm.chat.entity.ChatMessage;
import com.ssafy.algoFarm.group.entity.Member;
import com.ssafy.algoFarm.solution.entity.AlgorithmSolution;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(name = "oauth_id")
    private String oAuthId;  // 이 필드가 있는지 확인하세요

    @Column(nullable = false)
    private String name;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<String> roles = new HashSet<>();

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }
    @Column(nullable = false)
    private boolean accountNonExpired = true;

    @Column(nullable = false)
    private boolean accountNonLocked = true;

    @Column(nullable = false)
    private boolean credentialsNonExpired = true;

    @Column(nullable = false)
    private boolean enabled = true;
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
    @Column(name = "is_email_verified")
    private Boolean isEmailVerified;

    @Column(name = "provider")
    private String provider;

    @OneToMany(mappedBy = "user")
    private List<ChatMessage> messages = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<Member> members = new ArrayList<>();
    
    @OneToMany(mappedBy = "user")
    private List<AlgorithmSolution> solutions = new ArrayList<>();


}
