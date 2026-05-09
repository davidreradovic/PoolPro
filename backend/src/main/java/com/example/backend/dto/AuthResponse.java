package com.example.backend.dto;

public class AuthResponse {
    private Integer idUser;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String message;

    public AuthResponse(Integer idUser, String username, String firstName, String lastName,
                        String email, String role, String message) {
        this.idUser = idUser;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.message = message;
    }

    public Integer getIdUser() { return idUser; }
    public String getUsername() { return username; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getMessage() { return message; }
}