package com.ssafy.algoFarm.exception;

import ch.qos.logback.classic.spi.StackTraceElementProxy;
import ch.qos.logback.core.AppenderBase;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.IThrowableProxy;
import com.google.gson.Gson;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Component
public class MMAppender extends AppenderBase<ILoggingEvent> {
    private static final String WEBHOOK_URL = "https://meeting.ssafy.com/hooks/wm77yto8kfd98mudd9z6pm51ca";
    private final Environment env;

    public MMAppender(Environment env) {
        this.env = env;
    }

    @Override
    protected void append(ILoggingEvent event) {
        if (isProdProfile() && isErrorOrException(event)) {
            String message = formatLogMessage(event);
            try {
                sendToMM(message);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private boolean isProdProfile() {
        String[] activeProfiles = env.getActiveProfiles();
        for (String profile : activeProfiles) {
            if ("prod".equals(profile)) {
                return true;
            }
        }
        return false;
    }

    private boolean isErrorOrException(ILoggingEvent event) {
        return event.getLevel().isGreaterOrEqual(ch.qos.logback.classic.Level.ERROR) || event.getThrowableProxy() != null;
    }

    private String formatLogMessage(ILoggingEvent event) {
        StringBuilder sb = new StringBuilder();
        sb.append("### ").append(event.getLevel()).append(": ").append(event.getLoggerName()).append("\n\n");
        sb.append("```\n");
        sb.append(event.getFormattedMessage()).append("\n");

        IThrowableProxy throwableProxy = event.getThrowableProxy();
        if (throwableProxy != null) {
            sb.append("\nException stack trace:\n");
            sb.append(throwableProxy.getClassName()).append(": ").append(throwableProxy.getMessage()).append("\n");
            for (StackTraceElementProxy ste : throwableProxy.getStackTraceElementProxyArray()) {
                sb.append("\tat ").append(ste.toString()).append("\n");
            }
        }

        sb.append("```");

        Map<String, String> message = new HashMap<>();
        message.put("text", sb.toString());
        return new Gson().toJson(message);
    }

    private void sendToMM(String message) throws IOException {
        URL url = new URL(WEBHOOK_URL);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);

        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(conn.getOutputStream(), StandardCharsets.UTF_8))) {
            writer.write(message);
            writer.flush();
        }

        int responseCode = conn.getResponseCode();
        conn.disconnect();

        if (responseCode != 200) {
            System.err.println("HTTP Request failed with response code " + responseCode);
        } else {
            System.out.println("Message sent successfully to Mattermost");
        }
    }
}