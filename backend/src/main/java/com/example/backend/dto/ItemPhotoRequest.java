package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ItemPhotoRequest {

    @NotNull(message = "Item id is required")
    private Integer itemId;

    @NotBlank(message = "Image path is required")
    @Size(max = 255, message = "Image path must be less than 255 characters")
    private String img;

    @NotBlank(message = "Title is required")
    @Size(max = 45, message = "Title must be less than 45 characters")
    private String title;

    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }
    public String getImg() { return img; }
    public void setImg(String img) { this.img = img; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
