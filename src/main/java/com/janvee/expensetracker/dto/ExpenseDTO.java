package com.janvee.expensetracker.dto;

import lombok.Data;

@Data
public class ExpenseDTO {

    private Long id;
    private String category;
    private double amount;

}