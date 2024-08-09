package com.ssafy.algoFarm.exception;

public class AsyncConnectionException extends BusinessException {
    public AsyncConnectionException() {
        super(ErrorCode.ASYNC_CONNECTION_ERROR);
    }

    public AsyncConnectionException(String message) {
        super(ErrorCode.ASYNC_CONNECTION_ERROR, message);
    }
}