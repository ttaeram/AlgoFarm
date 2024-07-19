package com.ssafy.algoFarm.chat.repository;

import com.ssafy.algoFarm.chat.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
}
