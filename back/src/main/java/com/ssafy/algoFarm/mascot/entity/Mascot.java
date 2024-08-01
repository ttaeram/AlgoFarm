package com.ssafy.algoFarm.mascot.entity;

import com.ssafy.algoFarm.group.entity.Group;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.util.List;

@Entity
@Getter
@Table(name = "mascot")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mascot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private MascotType type;

    @Setter
    @Column(columnDefinition = "BIGINT DEFAULT 0")
    private Double currentExp;

    @Setter
    @Column(columnDefinition = "BIGINT DEFAULT 100")
    private Double maxExp;

    @Setter
    @Column(columnDefinition = "INTEGER DEFAULT 1")
    private Integer level;

    @Setter
    @Column(columnDefinition = "INTEGER DEFAULT 100")
    private Integer attack;

    @Setter
    @Column(columnDefinition = "INTEGER DEFAULT 100")
    private Integer defense;

    @Setter
    @Column(columnDefinition = "INTEGER DEFAULT 100")
    private Integer health;

    @Setter
    @Column(columnDefinition = "INTEGER DEFAULT 100")
    private Integer speed;

    @Setter
    @Column(columnDefinition = "INTEGER DEFAULT 100")
    private Integer evasion;

    @Setter
    @Column(columnDefinition = "INTEGER DEFAULT 100")
    private Integer accuracy;

    @OneToOne(mappedBy = "mascot")
    private Group group;

    public void setGroup(Group group) {
        this.group = group;
        if (group != null && group.getMascot() != this) {
            group.setMascot(this);
        }
    }
}
