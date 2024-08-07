package com.ssafy.global.sentry;

import io.sentry.Hint;
import io.sentry.SentryEvent;
import io.sentry.SentryOptions.BeforeSendCallback;
import io.sentry.spring.jakarta.EnableSentry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@EnableSentry(dsn = "https://6472238349ce3175d28cc2554ec6291c@o4507728783540224.ingest.de.sentry.io/4507728791601232")
@Configuration
public class SentryConfiguration {

    @Bean
    public BeforeSendCallback beforeSendCallback() {
        return new BeforeSendCallback() {
            @Override
            public SentryEvent execute(SentryEvent event, Hint hint) {
                // 로컬 환경에서는 이벤트를 전송하지 않음
                System.out.println("before send callback");
                String environment = System.getProperty("spring.profiles.active");
                if ("prod".equals(environment)) {
                    return null;
                }
                return event;
            }
        };
    }
}
