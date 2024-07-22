package com.ssafy.global.response;


import org.springframework.http.HttpStatus;

public class DataResponse<T> extends CustomApiResponse {
    //응답 데이터
    private final T data;

    private DataResponse(HttpStatus status, String message, T data) {
        super(status, message);
        this.data = data;
    }

    public static <T> DataResponse<T> of(HttpStatus status, String message, T data) {
        return new DataResponse<>(status, message, data);
    }
}
