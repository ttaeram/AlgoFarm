package com.ssafy.algoFarm.algo.user.entity;

import com.ssafy.algoFarm.chat.entity.ChatMessage;
import com.ssafy.algoFarm.group.entity.Member;
import com.ssafy.algoFarm.solution.entity.AlgorithmSolution;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "users") // "user"는 예약어일 수 있으므로 "users"로 변경
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
    private String oAuthId;

    @Column(nullable = false)
    private String name;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<String> roles = new HashSet<>();

    @Column(nullable = false, unique = true)
    private String email;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    @Column(nullable = false)
    private boolean accountNonExpired = true;

    @Column(nullable = false)
    private boolean accountNonLocked = true;

    @Column(nullable = false)
    private boolean credentialsNonExpired = true;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "is_email_verified")
    private Boolean isEmailVerified;

    @Column(name = "provider")
    private String provider;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Member> members = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AlgorithmSolution> solutions = new ArrayList<>();

    public Map<String, Object> getAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("sub", this.oAuthId);
        attributes.put("name", this.name);
        attributes.put("email", this.email);
        attributes.put("provider", this.provider);
        attributes.put("roles", this.roles);
        attributes.put("created_at", this.createdAt.toString());
        attributes.put("updated_at", this.updatedAt.toString());
        attributes.put("is_email_verified", this.isEmailVerified);
        attributes.put("account_non_expired", this.accountNonExpired);
        attributes.put("account_non_locked", this.accountNonLocked);
        attributes.put("credentials_non_expired", this.credentialsNonExpired);
        attributes.put("enabled", this.enabled);
        return attributes;
    }
}