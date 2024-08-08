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
public class SentChatMessageDTO {
    private Long userId;
    private String content;
    private String nickname;
    private LocalDateTime createAt;
}
