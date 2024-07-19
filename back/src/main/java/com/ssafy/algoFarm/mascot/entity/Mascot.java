package com.ssafy.algoFarm.mascot.entity;

import com.ssafy.algoFarm.group.entity.Group;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Getter
@NoArgsConstructor
public class Mascot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mascotId;

    private String name;

    private String profileUrl;

    @OneToMany(mappedBy = "mascot")
    private List<Group> mascots;

    @OneToMany(mappedBy = "mascot")
    private List<MascotMotion> mascotMotions;
}
