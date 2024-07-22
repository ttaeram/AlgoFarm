package com.ssafy.algoFarm.chat;

import com.ssafy.algoFarm.chat.entity.ChatMessage;
import io.swagger.v3.oas.annotations.Operation;
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
    public ResponseEntity<List<ChatMessage>> getAll(@PathVariable String chatroomId) {
        return ResponseEntity.ok(chatService.getAllChatMessages(Long.parseLong(chatroomId)));
    }

    /**
     * 채팅을 전송하는 API
     * @param chatroomId 채팅방 ID(= 그룹 아이디)
     * @param chatMessage 채팅 내용.
     * @return ResponseEntity<String>
     */
    @PostMapping("/{chatroomId}/send")
    @Operation(summary = "Send message on chatroom", description = "API to send chat for a certain chat room")
    public ResponseEntity<String> send(@PathVariable String chatroomId, @RequestBody ChatMessage chatMessage) {
        System.out.println(chatMessage.toString());

        messagingTemplate.convertAndSend("/chat/" + chatroomId, chatMessage);
        chatService.saveChatMessage(chatMessage);
        return ResponseEntity.ok("Sent chatroomId " + chatroomId);
    }
}