package com.ssafy.algoFarm.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // Mascot
    MASCOT_NOT_FOUND(HttpStatus.BAD_REQUEST, "M001", "해당 마스코트에 대한 마스코트 정보가 없습니다."),

    // Group
    GROUP_NOT_FOUND(HttpStatus.BAD_REQUEST, "G001", "해당 코드의 그룹이 없습니다."),
    MEMBER_NOT_EXIST(HttpStatus.FORBIDDEN, "G002", "해당 그룹에 멤버가 존재하지 않습니다."),

    // User
    USER_NOT_FOUND(HttpStatus.BAD_REQUEST, "U001", "해당하는 ID의 유저가 없습니다."),

    // Solution
    SOLUTION_NOT_FOUND(HttpStatus.BAD_REQUEST, "S001", "유저ID와 문제ID에 해당하는 문제 정보가 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    public int getStatus() {
        return this.status.value();
    }

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}
