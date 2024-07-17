package org.example.algo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@EntityScan("org.example.jenkinstest.Auth")

class JenkinsTestApplicationTests {

    @Test
    void contextLoads() {
    }

}
