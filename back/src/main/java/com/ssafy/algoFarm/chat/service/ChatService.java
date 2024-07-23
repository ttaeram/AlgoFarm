package com.ssafy.algoFarm.chat.service;

import com.ssafy.algoFarm.algo.user.UserRepository;
import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.chat.entity.ChatMessage;
import com.ssafy.algoFarm.chat.entity.ChatMessageReqDTO;
import com.ssafy.algoFarm.chat.entity.ChatMessageResDTO;
import com.ssafy.algoFarm.chat.repository.ChatMessageRepository;
import com.ssafy.algoFarm.group.entity.Group;
import com.ssafy.algoFarm.group.repository.GroupRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;


@Service
@Transactional
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;

    public ChatService(ChatMessageRepository chatMessageRepository, UserRepository userRepository, GroupRepository groupRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
    }

    public List<ChatMessageResDTO> getAllChatMessages(long groupId) {
        List<ChatMessage> chatMessages = chatMessageRepository.findByGroupId(groupId);
        List<ChatMessageResDTO> chatMessageResDTOList = new ArrayList<>();
        for (ChatMessage chatMessage : chatMessages) {
            ChatMessageResDTO chatMessageResDTO = new ChatMessageResDTO(chatMessage.getNickname(), chatMessage.getContent(), chatMessage.getCreateAt());
            chatMessageResDTOList.add(chatMessageResDTO);
        }
        return chatMessageResDTOList;
    }

    public void saveChatMessage(ChatMessageReqDTO chatMessageReqDTO) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setNickname(chatMessageReqDTO.getNickname());
        chatMessage.setContent(chatMessageReqDTO.getContent());
        chatMessage.setCreateAt(chatMessageReqDTO.getCreateAt());

        Group sendGroup = groupRepository.findById(chatMessageReqDTO.getGroupId()).get();
        User sendUser = userRepository.findById(chatMessageReqDTO.getUserId()).get();

        chatMessage.setGroup(sendGroup);
        chatMessage.setUser(sendUser);

        chatMessageRepository.save(chatMessage);
    }
}
