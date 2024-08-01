package com.ssafy.algoFarm.mascot.entity;

import com.ssafy.algoFarm.mascot.entity.ExperienceRate;
import com.ssafy.algoFarm.mascot.repository.ExperienceRateRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(ExperienceRateRepository repository) {
        return args -> {
            repository.save(new ExperienceRate(null, "Bronze_5", 10.0));
            repository.save(new ExperienceRate(null, "Bronze_4", 11.0));
            repository.save(new ExperienceRate(null, "Bronze_3", 12.1));
            repository.save(new ExperienceRate(null, "Bronze_2", 13.31));
            repository.save(new ExperienceRate(null, "Bronze_1", 14.641));

            repository.save(new ExperienceRate(null, "Silver_5", 20.0));
            repository.save(new ExperienceRate(null, "Silver_4", 23.0));
            repository.save(new ExperienceRate(null, "Silver_3", 26.45));
            repository.save(new ExperienceRate(null, "Silver_2", 30.4175));
            repository.save(new ExperienceRate(null, "Silver_1", 34.980125));

            repository.save(new ExperienceRate(null, "Gold_5", 50.0));
            repository.save(new ExperienceRate(null, "Gold_4", 60.0));
            repository.save(new ExperienceRate(null, "Gold_3", 72.0));
            repository.save(new ExperienceRate(null, "Gold_2", 86.4));
            repository.save(new ExperienceRate(null, "Gold_1", 103.68));

            repository.save(new ExperienceRate(null, "Platinum_5", 150.0));
            repository.save(new ExperienceRate(null, "Platinum_4", 187.5));
            repository.save(new ExperienceRate(null, "Platinum_3", 234.375));
            repository.save(new ExperienceRate(null, "Platinum_2", 292.96875));
            repository.save(new ExperienceRate(null, "Platinum_1", 366.210938));

            repository.save(new ExperienceRate(null, "Diamond_5", 500.0));
            repository.save(new ExperienceRate(null, "Diamond_4", 650.0));
            repository.save(new ExperienceRate(null, "Diamond_3", 845.0));
            repository.save(new ExperienceRate(null, "Diamond_2", 1098.5));
            repository.save(new ExperienceRate(null, "Diamond_1", 1428.05));

            repository.save(new ExperienceRate(null, "Ruby_5", 1600.0));
            repository.save(new ExperienceRate(null, "Ruby_4", 2160.0));
            repository.save(new ExperienceRate(null, "Ruby_3", 2916.0));
            repository.save(new ExperienceRate(null, "Ruby_2", 3936.6));
            repository.save(new ExperienceRate(null, "Ruby_1", 5314.41));
        };
    }
}
