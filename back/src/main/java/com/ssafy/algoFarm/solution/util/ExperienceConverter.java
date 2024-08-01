package com.ssafy.algoFarm.solution.util;

import java.util.HashMap;
import java.util.Map;

public class ExperienceConverter {

    // Map을 사용하여 levelName을 키로, 경험치를 값으로 저장
    private static final Map<String, Integer> problemExperienceMap = new HashMap<>();

    static {
        // levelName과 경험치를 저장
        problemExperienceMap.put("Unrated", 0);
        problemExperienceMap.put("Bronze V", 100);
        problemExperienceMap.put("Bronze IV", 200);
        problemExperienceMap.put("Bronze III", 300);
        problemExperienceMap.put("Bronze II", 400);
        problemExperienceMap.put("Bronze I", 500);
        problemExperienceMap.put("Silver V", 600);
        problemExperienceMap.put("Silver IV", 700);
        problemExperienceMap.put("Silver III", 800);
        problemExperienceMap.put("Silver II", 900);
        problemExperienceMap.put("Silver I", 1000);
        problemExperienceMap.put("Gold V", 1100);
        problemExperienceMap.put("Gold IV", 1200);
        problemExperienceMap.put("Gold III", 1300);
        problemExperienceMap.put("Gold II", 1400);
        problemExperienceMap.put("Gold I", 1500);
        problemExperienceMap.put("Platinum V", 1600);
        problemExperienceMap.put("Platinum IV", 1700);
        problemExperienceMap.put("Platinum III", 1800);
        problemExperienceMap.put("Platinum II", 1900);
        problemExperienceMap.put("Platinum I", 2000);
        problemExperienceMap.put("Diamond V", 2100);
        problemExperienceMap.put("Diamond IV", 2200);
        problemExperienceMap.put("Diamond III", 2300);
        problemExperienceMap.put("Diamond II", 2400);
        problemExperienceMap.put("Diamond I", 2500);
        problemExperienceMap.put("Ruby V", 2600);
        problemExperienceMap.put("Ruby IV", 2700);
        problemExperienceMap.put("Ruby III", 2800);
        problemExperienceMap.put("Ruby II", 2900);
        problemExperienceMap.put("Ruby I", 3000);
        problemExperienceMap.put("Master", 3100);
    }

    // 특정 levelName에 해당하는 경험치를 반환하는 메서드
    public static int getExperienceByLevelName(String levelName) {
        return problemExperienceMap.getOrDefault(levelName, 0);  // 일치하는 levelName이 없을 경우 0 반환
    }
}