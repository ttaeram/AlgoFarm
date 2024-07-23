package com.ssafy.global.response;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * 데이터 없이 상태와, 응답메세지만 필요한 경우사용하는 응답형태
 */
@Getter
public class MessageResponse extends CustomApiResponse {
    protected MessageResponse(HttpStatus status, String message) {
        super(status, message);
    }

    public static MessageResponse of(HttpStatus status, String message) {
        return new MessageResponse(status, message);
    }
}
