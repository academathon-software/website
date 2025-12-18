package com.academathon.repository;

import com.academathon.model.Conversation;
import com.academathon.model.Message;
import com.academathon.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findByConversationOrderByCreatedAtAsc(Conversation conversation);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation = :conversation AND m.sender != :currentUser AND m.isRead = false")
    Long countUnreadMessages(@Param("conversation") Conversation conversation, @Param("currentUser") User currentUser);
    
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation = :conversation AND m.sender != :currentUser AND m.isRead = false")
    void markConversationAsRead(@Param("conversation") Conversation conversation, @Param("currentUser") User currentUser);
}










