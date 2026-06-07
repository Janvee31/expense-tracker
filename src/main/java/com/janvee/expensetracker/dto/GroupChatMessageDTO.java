package com.janvee.expensetracker.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GroupChatMessageDTO {
    private Long id;
    private String content;
    private LocalDateTime timestamp;
    private String senderEmail;
    private String senderIcon;

    public GroupChatMessageDTO() {}

    public GroupChatMessageDTO(Long id, String content, LocalDateTime timestamp, String senderEmail, String senderIcon) {
        this.id = id;
        this.content = content;
        this.timestamp = timestamp;
        this.senderEmail = senderEmail;
        this.senderIcon = senderIcon;
    }
}
