package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateTaskCommentRequest {

    @NotNull(message = "Task id is required")
    private Integer taskId;

    private Integer replyId;

    @NotBlank(message = "Content is required")
    @Size(max = 2000, message = "Content must be less than 2000 characters")
    private String content;

    public Integer getTaskId() { return taskId; }
    public void setTaskId(Integer taskId) { this.taskId = taskId; }
    public Integer getReplyId() { return replyId; }
    public void setReplyId(Integer replyId) { this.replyId = replyId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
