package com.ssafy.algoFarm.mascot.entity;

public record MascotDataDto(
    Double currentExp,
    Double maxExp,
    Integer level,
    MascotType type
){}
