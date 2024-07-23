package com.ssafy.algoFarm.chat.service;

import com.ssafy.algoFarm.chat.entity.ChatMessage;
import com.ssafy.algoFarm.chat.entity.ChatMessageDTO;
import com.ssafy.algoFarm.chat.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;


@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;

    public ChatService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    public List<ChatMessageDTO> getAllChatMessages(long groupId) {
        List<ChatMessage> chatMessages = chatMessageRepository.findByGroupId(groupId);
        List<ChatMessageDTO> chatMessageDTOList = new ArrayList<>();
        for (ChatMessage chatMessage : chatMessages) {
            ChatMessageDTO chatMessageDTO = new ChatMessageDTO(chatMessage.getNickname(), chatMessage.getContent(), chatMessage.getCreateAt());
            chatMessageDTOList.add(chatMessageDTO);
        }
        return chatMessageDTOList;
    }

    public void saveChatMessage(ChatMessage chatMessage) {
        chatMessageRepository.save(chatMessage);
    }
}
