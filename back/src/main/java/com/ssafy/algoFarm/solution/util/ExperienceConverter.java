package com.ssafy.algoFarm.solution.util;

import java.util.HashMap;
import java.util.Map;

public class ExperienceConverter {

    private static final Map<String, Integer> levelToExperienceMap = new HashMap<>();

    static {
        levelToExperienceMap.put("Unrated", 0);
        levelToExperienceMap.put("Bronze V", 1);
        levelToExperienceMap.put("Bronze IV", 2);
        levelToExperienceMap.put("Bronze III", 3);
        levelToExperienceMap.put("Bronze II", 4);
        levelToExperienceMap.put("Bronze I", 5);
        levelToExperienceMap.put("Silver V", 6);
        levelToExperienceMap.put("Silver IV", 7);
        levelToExperienceMap.put("Silver III", 8);
        levelToExperienceMap.put("Silver II", 9);
        levelToExperienceMap.put("Silver I", 10);
        levelToExperienceMap.put("Gold V", 11);
        levelToExperienceMap.put("Gold IV", 12);
        levelToExperienceMap.put("Gold III", 13);
        levelToExperienceMap.put("Gold II", 14);
        levelToExperienceMap.put("Gold I", 15);
        levelToExperienceMap.put("Platinum V", 16);
        levelToExperienceMap.put("Platinum IV", 17);
        levelToExperienceMap.put("Platinum III", 18);
        levelToExperienceMap.put("Platinum II", 19);
        levelToExperienceMap.put("Platinum I", 20);
        levelToExperienceMap.put("Diamond V", 21);
        levelToExperienceMap.put("Diamond IV", 22);
        levelToExperienceMap.put("Diamond III", 23);
        levelToExperienceMap.put("Diamond II", 24);
        levelToExperienceMap.put("Diamond I", 25);
        levelToExperienceMap.put("Ruby V", 26);
        levelToExperienceMap.put("Ruby IV", 27);
        levelToExperienceMap.put("Ruby III", 28);
        levelToExperienceMap.put("Ruby II", 29);
        levelToExperienceMap.put("Ruby I", 30);
        levelToExperienceMap.put("Master", 31);
    }

    public static int convertLevelToExperience(String level) {
        return levelToExperienceMap.getOrDefault(level, 0);
    }
}