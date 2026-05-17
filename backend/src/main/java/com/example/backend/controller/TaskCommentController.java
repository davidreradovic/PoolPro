package com.example.backend.controller;

import com.example.backend.entity.Task;
import com.example.backend.entity.TaskComment;
import com.example.backend.entity.User;
import com.example.backend.repository.TaskCommentRepository;
import com.example.backend.repository.TaskRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/task-comments")
@CrossOrigin(origins = "*")
public class TaskCommentController {

    private final TaskCommentRepository taskCommentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskCommentController(
            TaskCommentRepository taskCommentRepository,
            TaskRepository taskRepository,
            UserRepository userRepository
    ) {
        this.taskCommentRepository = taskCommentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Object createComment(
            @RequestBody Map<String, Object> request
    ) {

        Integer taskId = (Integer) request.get("taskId");
        Integer userId = (Integer) request.get("userId");

        Integer replyId = null;

        if (request.get("replyId") != null) {
            replyId = (Integer) request.get("replyId");
        }

        String content = (String) request.get("content");

        if (content == null || content.trim().isEmpty()) {
            return "Comment content is required";
        }

        Task task = taskRepository.findById(taskId).orElse(null);

        if (task == null) {
            return "Task not found";
        }

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return "User not found";
        }

        TaskComment reply = null;

        if (replyId != null) {
            reply = taskCommentRepository.findById(replyId).orElse(null);

            if (reply == null) {
                return "Reply comment not found";
            }
        }

        TaskComment comment = new TaskComment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setContent(content);
        comment.setReply(reply);

        TaskComment saved = taskCommentRepository.save(comment);

        saved = taskCommentRepository.findById(
                saved.getIdTaskComment()
        ).orElse(saved);

        Map<String, Object> response = new HashMap<>();

        response.put(
                "idTaskComment",
                saved.getIdTaskComment()
        );

        response.put(
                "taskId",
                saved.getTask().getIdTask()
        );

        response.put(
                "userId",
                saved.getUser().getIdUser()
        );

        response.put(
                "username",
                saved.getUser().getUsername()
        );

        response.put(
                "content",
                saved.getContent()
        );

        response.put(
                "timestamp",
                saved.getTimestamp()
        );

        if (saved.getReply() != null) {
            response.put(
                    "replyId",
                    saved.getReply().getIdTaskComment()
            );
        }

        return response;
    }

     /*
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public Object createComment(
            @Valid @RequestBody CreateTaskCommentRequest request,
            Authentication authentication
    ) {

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElse(null);

        if (user == null) {
            return "User not found";
        }

        Integer taskId = request.getTaskId();

        Integer replyId = request.getReplyId();

        String content = request.getContent();

        Task task = taskRepository.findById(taskId).orElse(null);

        if (task == null) {
            return "Task not found";
        }

        TaskComment reply = null;

        if (replyId != null) {
            reply = taskCommentRepository.findById(replyId)
                    .orElse(null);

            if (reply == null) {
                return "Reply comment not found";
            }
        }

        TaskComment comment = new TaskComment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setContent(content);
        comment.setReply(reply);

        TaskComment saved = taskCommentRepository.save(comment);

        saved = taskCommentRepository.findById(
                saved.getIdTaskComment()
        ).orElse(saved);

        Map<String, Object> response = new HashMap<>();

        response.put("idTaskComment", saved.getIdTaskComment());
        response.put("taskId", saved.getTask().getIdTask());
        response.put("userId", saved.getUser().getIdUser());
        response.put("username", saved.getUser().getUsername());
        response.put("content", saved.getContent());
        response.put("timestamp", saved.getTimestamp());

        if (saved.getReply() != null) {
            response.put(
                    "replyId",
                    saved.getReply().getIdTaskComment()
            );
        }

        return response;
    }*/

    @GetMapping("/task/{taskId}")
    public Object getCommentsByTask(
            @PathVariable Integer taskId
    ) {

        return taskCommentRepository.findByTask_IdTask(taskId)
                .stream()
                .map(comment -> {

                    Map<String, Object> response = new HashMap<>();

                    response.put(
                            "idTaskComment",
                            comment.getIdTaskComment()
                    );

                    response.put(
                            "content",
                            comment.getContent()
                    );

                    response.put(
                            "timestamp",
                            comment.getTimestamp()
                    );

                    response.put(
                            "userId",
                            comment.getUser().getIdUser()
                    );

                    response.put(
                            "username",
                            comment.getUser().getUsername()
                    );

                    if (comment.getReply() != null) {
                        response.put(
                                "replyId",
                                comment.getReply().getIdTaskComment()
                        );
                    }

                    return response;
                })
                .toList();
    }
}