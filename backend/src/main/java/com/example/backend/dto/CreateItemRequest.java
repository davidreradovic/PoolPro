package com.example.backend.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class CreateItemRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be 0 or greater")
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.01", message = "Unit price must be greater than 0")
    private BigDecimal unitPrice;

    @NotBlank(message = "Category is required")
    private String category;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
