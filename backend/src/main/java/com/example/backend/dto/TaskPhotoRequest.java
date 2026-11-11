package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class TaskPhotoRequest {

    @NotNull(message = "Task id is required")
    private Integer taskId;

    @NotBlank(message = "Image path is required")
    @Size(max = 255, message = "Image path must be less than 255 characters")
    private String img;

    public Integer getTaskId() { return taskId; }
    public void setTaskId(Integer taskId) { this.taskId = taskId; }
    public String getImg() { return img; }
    public void setImg(String img) { this.img = img; }
}
