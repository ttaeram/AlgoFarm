package com.ssafy.algoFarm.mascot.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class MascotMotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="mascot_motion_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name="mascot_id")
    private Mascot mascot;

    private String thumbnailUrl;

    private String motionUrl;

    private Integer accessLevel;

    public void setMascot(Mascot mascot) {
        if(mascot != null){
            this.mascot.getMascotMotions().remove(this);
        }
        this.mascot = mascot;
        mascot.getMascotMotions().add(this);
    }

}
