package com.janvee.expensetracker.exception;

import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ExpenseNotFoundException.class)
    public String handleExpenseNotFound(ExpenseNotFoundException ex) {
        return ex.getMessage();
    }
}