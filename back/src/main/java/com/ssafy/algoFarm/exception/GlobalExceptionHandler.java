package com.ssafy.algoFarm.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    private final MMBotAdvice mmBotAdvice;

    public GlobalExceptionHandler(MMBotAdvice mmBotAdvice) {
        this.mmBotAdvice = mmBotAdvice;
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) throws IOException {
        log.warn("Business exception occurred: {}", e.getMessage());
        ErrorCode errorCode = e.getErrorCode();
        ErrorResponse response = ErrorResponse.of(errorCode);

        // MMBotAdvice를 통해 예외 처리 및 로깅
        ResponseEntity<String> mmBotResponse = mmBotAdvice.handleException(e);
        log.info("MMBotAdvice response: {}", mmBotResponse.getBody());

        return new ResponseEntity<>(response, HttpStatus.valueOf(errorCode.getStatus()));
    }

    @ExceptionHandler(AsyncConnectionException.class)
    public ResponseEntity<ErrorResponse> handleAsyncConnectionException(AsyncConnectionException e) throws IOException {
        log.warn("Async connection exception occurred: {}", e.getMessage());
        ErrorResponse response = ErrorResponse.of(e.getErrorCode());

        // MMBotAdvice를 통해 예외 처리 및 로깅
        ResponseEntity<String> mmBotResponse = mmBotAdvice.handleException(e);
        log.info("MMBotAdvice response: {}", mmBotResponse.getBody());

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception e) throws IOException {
        log.error("Unhandled exception occurred: {}", e.getMessage());

        // MMBotAdvice를 통해 예외 처리 및 로깅
        ResponseEntity<String> mmBotResponse = mmBotAdvice.handleException(e);
        log.info("MMBotAdvice response: {}", mmBotResponse.getBody());

        ErrorResponse response = ErrorResponse.of(ErrorCode.INTERNAL_SERVER_ERROR);
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}