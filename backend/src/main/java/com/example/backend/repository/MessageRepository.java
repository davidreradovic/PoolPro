package com.example.backend.repository;

import com.example.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Integer> {

    List<Message> findBySender_IdUserAndReceiver_IdUserOrderByTimestampAsc(
            Integer senderId,
            Integer receiverId
    );

    List<Message> findByReceiver_IdUserAndIsReadFalse(Integer receiverId);

    List<Message> findBySender_IdUserOrReceiver_IdUser(Integer senderId, Integer receiverId);
}
