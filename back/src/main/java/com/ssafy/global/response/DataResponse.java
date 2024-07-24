package com.ssafy.global.response;


import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class DataResponse<T> extends CustomApiResponse {
    //응답 데이터
    private final T data;

    private DataResponse(HttpStatus status, String message, T data) {
        super(status, message);
        this.data = data;
    }

    public static <T> DataResponse<T> of(HttpStatus status, String message, T data) {
        return new DataResponse<T>(status, message, data);
    }

    // 빌더 패턴을 위한 정적 내부 클래스
    public static class Builder<T> {
        private HttpStatus status;
        private String message;
        private T data;

        public Builder<T> status(HttpStatus status) {
            this.status = status;
            return this;
        }

        public Builder<T> message(String message) {
            this.message = message;
            return this;
        }

        public Builder<T> data(T data) {
            this.data = data;
            return this;
        }

        public DataResponse<T> build() {
            return new DataResponse<>(status, message, data);
        }
    }

    public static <T> Builder<T> builder() {
        return new Builder<>();
    }
}
