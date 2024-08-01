package com.ssafy.algoFarm.mascot.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "experience_rates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceRate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "difficulty_level", nullable = false, unique = true)
    private String difficultyLevel;

    @Column(name = "exp_rate", nullable = false)
    private Double expRate;
}
