package com.ssafy.algoFarm.chat.controller;

import com.ssafy.algoFarm.chat.entity.ChatMessageReqDTO;
import com.ssafy.algoFarm.chat.entity.ChatMessageResDTO;
import com.ssafy.algoFarm.chat.service.ChatService;
import com.ssafy.algoFarm.chat.entity.ChatMessage;
import com.ssafy.global.response.DataResponse;
import com.ssafy.global.response.MessageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 채팅방에 입장하는 API, 그룹 가입할 때 자동 호출
     * @param chatroomId 채팅방 ID(=그룹 아이디)
     * @return ResponseEntity<String>
     */
    @PostMapping("/{chatroomId}/join")
    @Operation(summary="Enter Chatroom", description="API used to include a user in a chat room")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<String> join(@PathVariable String chatroomId, @RequestBody ChatMessage chatMessage) {
        messagingTemplate.convertAndSend("/chat/" + chatroomId, chatMessage);
        return ResponseEntity.ok("Joined chatroomId " + chatroomId);
    }

    /**
     * 과거 채팅을 가져오는 API
     * @param chatroomId 채팅방 ID(= 그룹 아이디)
     * @return 최근 30일간 채팅 리스트
     */
    @GetMapping("/{chatroomId}/all")
    @Operation(summary="Getting Chatlist", description = "API to get chat lists for a certain chat room")
    @SecurityRequirement(name = "bearerAuth")
    public DataResponse<List<ChatMessageResDTO>> getAll(@PathVariable Long chatroomId) {
        return DataResponse.of(HttpStatus.OK, "Chat Logs of "+chatroomId, chatService.getAllChatMessages(chatroomId));
    }

    /**
     * 채팅을 전송하는 API
     * @param chatroomId 채팅방 ID(= 그룹 아이디)
     * @param chatMessageReqDTO 채팅 내용.
     * @return ResponseEntity<String>
     */
    @PostMapping("/{chatroomId}/send")
    @Operation(summary = "Send message on chatroom", description = "API to send chat for a certain chat room")
    @SecurityRequirement(name = "bearerAuth")
    public MessageResponse send(@PathVariable Long chatroomId, @RequestBody ChatMessageReqDTO chatMessageReqDTO) {
        messagingTemplate.convertAndSend("/chat/" + chatroomId, chatMessageReqDTO.getContent());
        chatMessageReqDTO.setGroupId(chatroomId);
        chatService.saveChatMessage(chatMessageReqDTO);
        return MessageResponse.of(HttpStatus.OK, "Sent chatroomId " + chatroomId);
    }
}