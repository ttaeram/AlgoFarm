package com.ssafy.algoFarm.chat.service;

import com.ssafy.algoFarm.algo.user.UserRepository;
import com.ssafy.algoFarm.algo.user.entity.User;
import com.ssafy.algoFarm.chat.entity.ChatMessage;
import com.ssafy.algoFarm.chat.entity.ChatMessageReqDTO;
import com.ssafy.algoFarm.chat.entity.ChatMessageResDTO;
import com.ssafy.algoFarm.chat.repository.ChatMessageRepository;
import com.ssafy.algoFarm.exception.BusinessException;
import com.ssafy.algoFarm.exception.ErrorCode;
import com.ssafy.algoFarm.group.entity.Group;
import com.ssafy.algoFarm.group.repository.GroupRepository;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

        Group sendGroup = groupRepository.findById(chatMessageReqDTO.getGroupId()).orElseThrow(()-> new BusinessException(ErrorCode.GROUP_NOT_FOUND));
        User sendUser = userRepository.findById(chatMessageReqDTO.getUserId()).orElseThrow(()-> new BusinessException(ErrorCode.USER_NOT_FOUND));

        chatMessage.setGroup(sendGroup);
        chatMessage.setUser(sendUser);

        chatMessageRepository.save(chatMessage);
    }

    @Scheduled(cron = "0 0 2 * * ?") // 매일 새벽 2시에 실행
    @Transactional
    public void deleteOldMessages() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        chatMessageRepository.deleteMessagesOlderThan(cutoffDate);
    }
}
