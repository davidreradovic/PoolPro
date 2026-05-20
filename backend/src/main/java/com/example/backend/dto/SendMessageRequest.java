package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SendMessageRequest {

    @NotNull(message = "Receiver id is required")
    private Integer receiverId;

    @NotBlank(message = "Message content is required")
    @Size(max = 2000, message = "Message must be less than 2000 characters")
    private String content;

    public Integer getReceiverId() { return receiverId; }
    public void setReceiverId(Integer receiverId) { this.receiverId = receiverId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
