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
    private Long mascotMotionId;

    @ManyToOne
    @JoinColumn(name="mascot_id")
    private Mascot mascot;

    private String thumbnailUrl;

    private String motionUrl;

    private Integer accessLevel;

}
