package org.example.algo.chat;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.sql.Timestamp;

@Entity
@Getter
@Setter
@ToString
public class ChatMessage {
    @Id
    @GeneratedValue
    private long messageId;
    private long userId;
    private long groupId;
    private String nickname;
    private Timestamp date;
    private String content;
}
