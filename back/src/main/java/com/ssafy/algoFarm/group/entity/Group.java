package com.ssafy.algoFarm.group.entity;

import com.ssafy.algoFarm.chat.entity.ChatMessage;
import com.ssafy.algoFarm.mascot.entity.Mascot;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Entity
@Getter
@Table(name = "study_group")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "mascot_id")
    private Mascot mascot;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Setter
    private double currentNum;

    private double maxNum;

    @Setter
    private String name;

    @Setter
    private String description;

    @Setter
    private String code;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Member> members = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "group_algorithm_solved", joinColumns = @JoinColumn(name = "group_id"))
    @MapKeyEnumerated(EnumType.STRING)
    @MapKeyColumn(name = "algorithm_type")
    @Column(name = "solved_count")
    private Map<AlgorithmType, Integer> algorithmSolvedCount = new EnumMap<>(AlgorithmType.class);

    public void setMascot(Mascot mascot) {
        if (this.mascot != mascot) {
            this.mascot = mascot;
            if (mascot != null && mascot.getGroup() != this) {
                mascot.setGroup(this);
            }
        }
    }
}