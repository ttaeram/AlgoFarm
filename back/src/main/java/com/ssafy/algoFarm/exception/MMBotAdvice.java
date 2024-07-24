package com.ssafy.algoFarm.exception;

import com.google.gson.Gson;
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

    @ExceptionHandler(Exception.class)
    public String exception(Exception e) throws IOException {
        URL url = new URL("https://meeting.ssafy.com/hooks/wm77yto8kfd98mudd9z6pm51ca");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);

        Map<String, String> message = new HashMap<>();
        message.put("text", e.toString());

        String jsonString = new Gson().toJson(message);

        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(conn.getOutputStream(), StandardCharsets.UTF_8))) {
            writer.write(jsonString);
            writer.flush();
        }

        int responseCode = conn.getResponseCode();
        conn.disconnect();

        if (responseCode != 200) {
            System.err.println("HTTP Request failed with response code " + responseCode);
        } else {
            System.out.println("Message sent successfully");
        }

        return jsonString;
    }
}
