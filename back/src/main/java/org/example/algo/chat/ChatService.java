package org.example.algo.chat;

import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;

    public ChatService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    public List<ChatMessage> getAllChatMessages(long groupId) {
        return chatMessageRepository.findByGroupId(groupId);
    }
}
