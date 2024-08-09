package com.ssafy.algoFarm.mascot.entity;

import com.ssafy.algoFarm.group.entity.Group;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

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
    @Setter
    private MascotType type;

    @Setter
    private Double currentExp = 0.0;

    @Setter
    private Double maxExp = 100.0;

    @Setter
    private Integer level = 1;

    @Setter
    private Integer attack = 100;

    @Setter
    private Integer defense = 100 ;

    @Setter
    private Integer health = 100;

    @Setter
    private Integer speed = 100;

    @Setter
    private Integer evasion = 100;

    @Setter
    private Integer accuracy = 100;

    @OneToOne(mappedBy = "mascot")
    @JoinColumn(name = "group_id")
    private Group group;

    public void setGroup(Group group) {
        if (this.group != group) {
            this.group = group;
            if (group != null && group.getMascot() != this) {
                group.setMascot(this);
            }
        }
    }
}
