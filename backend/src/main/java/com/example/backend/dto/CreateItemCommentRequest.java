package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateItemCommentRequest {

    @NotNull(message = "Item id is required")
    private Integer itemId;

    private Integer replyId;

    @NotBlank(message = "Content is required")
    @Size(max = 2000, message = "Content must be less than 2000 characters")
    private String content;

    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }
    public Integer getReplyId() { return replyId; }
    public void setReplyId(Integer replyId) { this.replyId = replyId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
