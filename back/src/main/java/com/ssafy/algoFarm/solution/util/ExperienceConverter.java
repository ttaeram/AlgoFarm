package com.ssafy.algoFarm.solution.util;

import java.util.HashMap;
import java.util.Map;

public class ExperienceConverter {

    // Map을 사용하여 levelName을 키로, 경험치를 값으로 저장
    private static final Map<String, Double> problemExperienceMap = new HashMap<>();

    static {
        // levelName과 경험치를 저장
        problemExperienceMap.put("Unrated", 0.0);
        problemExperienceMap.put("Bronze V", 10.0);
        problemExperienceMap.put("Bronze IV", 11.0);
        problemExperienceMap.put("Bronze III", 12.1);
        problemExperienceMap.put("Bronze II", 13.31);
        problemExperienceMap.put("Bronze I", 14.641);
        problemExperienceMap.put("Silver V", 20.0);
        problemExperienceMap.put("Silver IV", 23.0);
        problemExperienceMap.put("Silver III", 26.45);
        problemExperienceMap.put("Silver II", 30.4175);
        problemExperienceMap.put("Silver I", 34.980125);
        problemExperienceMap.put("Gold V", 50.0);
        problemExperienceMap.put("Gold IV", 60.0);
        problemExperienceMap.put("Gold III", 72.0);
        problemExperienceMap.put("Gold II", 86.4);
        problemExperienceMap.put("Gold I", 103.68);
        problemExperienceMap.put("Platinum V", 150.0);
        problemExperienceMap.put("Platinum IV", 187.5);
        problemExperienceMap.put("Platinum III", 234.375);
        problemExperienceMap.put("Platinum II", 292.96875);
        problemExperienceMap.put("Platinum I", 366.210938);
        problemExperienceMap.put("Diamond V", 500.0);
        problemExperienceMap.put("Diamond IV", 650.0);
        problemExperienceMap.put("Diamond III", 845.0);
        problemExperienceMap.put("Diamond II", 1098.5);
        problemExperienceMap.put("Diamond I", 1428.05);
        problemExperienceMap.put("Ruby V", 1600.0);
        problemExperienceMap.put("Ruby IV", 2160.0);
        problemExperienceMap.put("Ruby III", 2916.0);
        problemExperienceMap.put("Ruby II", 3936.6);
        problemExperienceMap.put("Ruby I", 5314.41);
        problemExperienceMap.put("Master", 6000.0);
    }

    // 특정 levelName에 해당하는 경험치를 반환하는 메서드
    public static double getExperienceByLevelName(String levelName) {
        return problemExperienceMap.getOrDefault(levelName, 0.0);  // 일치하는 levelName이 없을 경우 0 반환
    }
}