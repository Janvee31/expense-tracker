package com.janvee.expensetracker.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ExpenseDTO {

    private Long id;
    private String category;
    private double amount;
    private LocalDate date;
}