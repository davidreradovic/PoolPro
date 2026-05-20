package com.example.backend.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class CreateReviewRequest {

    @NotNull(message = "Client id is required")
    private Integer clientId;

    @NotNull(message = "Item id is required")
    private Integer itemId;

    @NotNull(message = "Review is required")
    @DecimalMin(value = "0.0", message = "Review must be at least 0")
    @DecimalMax(value = "5.0", message = "Review must be at most 5")
    private BigDecimal review;

    @Size(max = 1000, message = "Description must be less than 1000 characters")
    private String description;

    public Integer getClientId() { return clientId; }
    public void setClientId(Integer clientId) { this.clientId = clientId; }
    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }
    public BigDecimal getReview() { return review; }
    public void setReview(BigDecimal review) { this.review = review; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
