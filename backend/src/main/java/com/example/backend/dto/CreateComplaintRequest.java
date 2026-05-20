package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateComplaintRequest {

    @NotBlank(message = "Complaint comment is required")
    @Size(max = 2000, message = "Complaint must be less than 2000 characters")
    private String comment;

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
