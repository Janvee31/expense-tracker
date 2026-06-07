package com.janvee.expensetracker.dto;

import lombok.Data;

@Data
public class UserDTO {
    private String email;
    private String profileIcon;

    public UserDTO() {}

    public UserDTO(String email, String profileIcon) {
        this.email = email;
        this.profileIcon = profileIcon;
    }
}
