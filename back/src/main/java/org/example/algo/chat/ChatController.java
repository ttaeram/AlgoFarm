package org.example.algo.chat;

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
     * 채팅방에 입장하는 API, 그룹 가입할 때 자동 호출?
     * @param chatroomId
     * @return ResponseEntity<String>
     */
    @PostMapping("/{chatroomId}/join")
    public ResponseEntity<String> join(@PathVariable String chatroomId, @RequestBody ChatMessage chatMessage) {
        messagingTemplate.convertAndSend("/chat/" + chatroomId, chatMessage);
        return ResponseEntity.ok("Joined chatroomId " + chatroomId);
    }

    @GetMapping("/{chatroomId}/all")
    public ResponseEntity<List<ChatMessage>> getAll(@PathVariable String chatroomId) {
        return ResponseEntity.ok(chatService.getAllChatMessages(Long.parseLong(chatroomId)));
    }
}