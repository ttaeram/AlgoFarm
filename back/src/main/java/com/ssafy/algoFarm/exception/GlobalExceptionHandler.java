package com.ssafy.algoFarm.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.IOException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    final private MMBotAdvice mmBotAdvice;
    public GlobalExceptionHandler(MMBotAdvice mmBotAdvice) {
        this.mmBotAdvice = mmBotAdvice;
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) throws IOException {
        log.warn(e.getMessage());
        ErrorCode errorCode = e.getErrorCode();
        ErrorResponse response = ErrorResponse.of(errorCode);
        mmBotAdvice.exception(e);
        return new ResponseEntity<>(response, HttpStatusCode.valueOf(errorCode.getStatus()));
    }
}
