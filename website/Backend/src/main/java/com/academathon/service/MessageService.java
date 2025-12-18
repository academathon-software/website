package com.academathon.service;

import com.academathon.dto.ConversationDTO;
import com.academathon.dto.MessageDTO;
import com.academathon.dto.SendMessageRequest;
import com.academathon.model.Booking;
import com.academathon.model.Conversation;
import com.academathon.model.Message;
import com.academathon.model.User;
import com.academathon.repository.BookingRepository;
import com.academathon.repository.ConversationRepository;
import com.academathon.repository.MessageRepository;
import com.academathon.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MessageService {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private ConversationRepository conversationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    public MessageDTO sendMessage(User sender, SendMessageRequest request) {
        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient not found"));
        
        final Booking booking;
        if (request.getBookingId() != null) {
            booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
        } else {
            booking = null;
        }
        
        // Find or create conversation
        Conversation conversation = conversationRepository.findByUsers(sender, recipient)
                .orElseGet(() -> {
                    Conversation newConv = new Conversation(sender, recipient, booking);
                    return conversationRepository.save(newConv);
                });
        
        // If booking is provided but conversation doesn't have it, update it
        if (booking != null && conversation.getBooking() == null) {
            conversation.setBooking(booking);
            conversationRepository.save(conversation);
        }
        
        // Create and save message
        Message message = new Message(conversation, sender, request.getContent());
        message = messageRepository.save(message);
        
        // Update conversation timestamp
        conversation.onUpdate();
        conversationRepository.save(conversation);
        
        return toMessageDTO(message);
    }
    
    public List<ConversationDTO> getUserConversations(User user) {
        List<Conversation> conversations = conversationRepository.findByUser(user);
        
        return conversations.stream()
                .map(conv -> toConversationDTO(conv, user))
                .collect(Collectors.toList());
    }
    
    public List<MessageDTO> getConversationMessages(Long conversationId, User currentUser) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        // Verify user is part of this conversation
        if (!conversation.getUser1().getId().equals(currentUser.getId()) && 
            !conversation.getUser2().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access to conversation");
        }
        
        List<Message> messages = messageRepository.findByConversationOrderByCreatedAtAsc(conversation);
        return messages.stream()
                .map(this::toMessageDTO)
                .collect(Collectors.toList());
    }
    
    public ConversationDTO getOrCreateConversation(User currentUser, Long otherUserId, Long bookingId) {
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        final Booking booking;
        if (bookingId != null) {
            booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
        } else {
            booking = null;
        }
        
        Conversation conversation = conversationRepository.findByUsers(currentUser, otherUser)
                .orElseGet(() -> {
                    Conversation newConv = new Conversation(currentUser, otherUser, booking);
                    return conversationRepository.save(newConv);
                });
        
        // If booking is provided but conversation doesn't have it, update it
        if (booking != null && conversation.getBooking() == null) {
            conversation.setBooking(booking);
            conversationRepository.save(conversation);
        }
        
        return toConversationDTO(conversation, currentUser);
    }
    
    public void markAsRead(Long conversationId, User currentUser) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        messageRepository.markConversationAsRead(conversation, currentUser);
    }
    
    private MessageDTO toMessageDTO(Message message) {
        return new MessageDTO(
                message.getId(),
                message.getConversation().getId(),
                message.getSender().getId(),
                message.getSender().getUsername(),
                message.getContent(),
                message.getIsRead(),
                message.getCreatedAt()
        );
    }
    
    private ConversationDTO toConversationDTO(Conversation conversation, User currentUser) {
        User otherUser = conversation.getUser1().getId().equals(currentUser.getId()) 
                ? conversation.getUser2() 
                : conversation.getUser1();
        
        // Get last message
        List<Message> messages = messageRepository.findByConversationOrderByCreatedAtAsc(conversation);
        String lastMessage = messages.isEmpty() ? null : messages.get(messages.size() - 1).getContent();
        var lastMessageTime = messages.isEmpty() ? conversation.getCreatedAt() : messages.get(messages.size() - 1).getCreatedAt();
        
        // Count unread messages
        Long unreadCount = messageRepository.countUnreadMessages(conversation, currentUser);
        
        return new ConversationDTO(
                conversation.getId(),
                otherUser.getId(),
                otherUser.getUsername(),
                otherUser.getRole().toString(),
                conversation.getBooking() != null ? conversation.getBooking().getId() : null,
                lastMessage,
                lastMessageTime,
                unreadCount,
                conversation.getCreatedAt(),
                conversation.getUpdatedAt()
        );
    }
}

