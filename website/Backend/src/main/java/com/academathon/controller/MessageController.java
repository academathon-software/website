package com.academathon.controller;

import com.academathon.dto.ConversationDTO;
import com.academathon.dto.MessageDTO;
import com.academathon.dto.SendMessageRequest;
import com.academathon.model.User;
import com.academathon.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    
    @Autowired
    private MessageService messageService;
    
    @PostMapping("/send")
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody SendMessageRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        
        MessageDTO message = messageService.sendMessage(currentUser, request);
        return ResponseEntity.ok(message);
    }
    
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        
        List<ConversationDTO> conversations = messageService.getUserConversations(currentUser);
        return ResponseEntity.ok(conversations);
    }
    
    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getConversationMessages(@PathVariable Long conversationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        
        List<MessageDTO> messages = messageService.getConversationMessages(conversationId, currentUser);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/conversations/with/{otherUserId}")
    public ResponseEntity<ConversationDTO> getOrCreateConversation(
            @PathVariable Long otherUserId,
            @RequestParam(required = false) Long bookingId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        
        ConversationDTO conversation = messageService.getOrCreateConversation(currentUser, otherUserId, bookingId);
        return ResponseEntity.ok(conversation);
    }
    
    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long conversationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) auth.getPrincipal();
        
        messageService.markAsRead(conversationId, currentUser);
        return ResponseEntity.ok().build();
    }
}










