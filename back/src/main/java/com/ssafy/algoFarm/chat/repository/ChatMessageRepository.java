package com.ssafy.algoFarm.chat.repository;

import com.ssafy.algoFarm.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByGroupId(long groupId);

    @Modifying
    @Query("DELETE FROM ChatMessage c WHERE c.createAt < :cutoffDate")
    void deleteMessagesOlderThan(LocalDateTime cutoffDate);
}
