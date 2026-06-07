package com.janvee.expensetracker.dto;

import lombok.Data;
import java.util.List;

@Data
public class FamilyGroupDTO {
    private Long id;
    private String name;
    private String inviteCode;
    private List<UserDTO> members;
}
