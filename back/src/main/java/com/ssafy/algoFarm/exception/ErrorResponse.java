package com.ssafy.algoFarm.exception;

import lombok.Getter;

@Getter
public class ErrorResponse {
    private final String message;
    private final int status;
    private final String code;

    public ErrorResponse(ErrorCode errorCode) {
        this.message = errorCode.getMessage();
        this.status = errorCode.getStatus();
        this.code = errorCode.getCode();
    }

    public static ErrorResponse of(ErrorCode errorCode) {
        return new ErrorResponse(errorCode);
    }
}
