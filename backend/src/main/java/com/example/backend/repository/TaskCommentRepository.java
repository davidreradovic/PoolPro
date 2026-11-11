package com.example.backend.repository;

import com.example.backend.entity.TaskComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskCommentRepository
        extends JpaRepository<TaskComment, Integer> {

    List<TaskComment> findByTask_IdTask(Integer taskId);
}
