package com.janvee.expensetracker.response;

import lombok.Data;

@Data
public class ApiResponse<T> {
    private T data;
    private String message;
    private boolean success;
}