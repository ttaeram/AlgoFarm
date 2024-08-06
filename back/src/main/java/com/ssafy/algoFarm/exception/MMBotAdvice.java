package com.ssafy.algoFarm.exception;

import com.google.gson.Gson;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class MMBotAdvice {

    @Autowired
    private Environment env;

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) throws IOException {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        String responseBody;

        if (isLocalProfileActive()) {
            // 로컬 프로파일인 경우 예외 스택을 콘솔에 출력
            e.printStackTrace();
            responseBody = "Exception occurred in local profile: " + e.getMessage();
        } else if (isProdProfileActive()) {
            // prod 프로파일인 경우 MM으로 전송
            String message = formatExceptionMessage(e);
            sendToMM(message);
            responseBody = "Exception occurred in prod profile. Details sent to MM.";
        } else {
            // 다른 프로파일의 경우 기본 처리
            responseBody = "Exception occurred: " + e.getMessage();
        }

        return new ResponseEntity<>(responseBody, status);
    }

    private boolean isLocalProfileActive() {
        return isProfileActive("local");
    }

    private boolean isProdProfileActive() {
        return isProfileActive("prod");
    }

    private boolean isProfileActive(String profileName) {
        String[] activeProfiles = env.getActiveProfiles();
        for (String profile : activeProfiles) {
            if (profileName.equals(profile)) {
                return true;
            }
        }
        return false;
    }

    private String formatExceptionMessage(Exception e) {
        StringBuilder sb = new StringBuilder();
        sb.append("### ").append(e.toString()).append("\n\n\n").append("```\n");

        for (StackTraceElement ste : e.getStackTrace()) {
            if (ste.toString().contains("com.ssafy")) {
                sb.append("[ !!! ] ");
            }
            sb.append(ste.toString()).append("\n");
        }
        sb.append("\n```");

        Map<String, String> message = new HashMap<>();
        message.put("text", sb.toString());
        return new Gson().toJson(message);
    }

    private void sendToMM(String message) throws IOException {
        URL url = new URL("https://meeting.ssafy.com/hooks/wm77yto8kfd98mudd9z6pm51ca");
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

        if (responseCode != HttpStatus.OK.value()) {
            System.err.println("HTTP Request to MM failed with response code " + responseCode);
        } else {
            System.out.println("Message sent successfully to MM");
        }
    }
}