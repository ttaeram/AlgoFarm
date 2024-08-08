package com.ssafy.algoFarm.chat.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageResDTO {
    private Long userId;
    private String nickname;
    private String content;
    private LocalDateTime createAt;
}
