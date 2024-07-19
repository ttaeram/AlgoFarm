package com.ssafy.algoFarm.chat;

import com.ssafy.algoFarm.chat.entity.ChatMessage;
import com.ssafy.algoFarm.chat.repository.ChatMessageRepository;
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

    public void saveChatMessage(ChatMessage chatMessage) {
        chatMessageRepository.save(chatMessage);
    }
}
