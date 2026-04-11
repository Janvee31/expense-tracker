package com.janvee.expensetracker.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Positive
    private double amount;

    @NotBlank
    private String category;

    private LocalDate date;

    private String userEmail;

    // "INCOME" or "EXPENSE"
    private String type;

    public Expense() {}

    public Expense(double amount, String category, LocalDate date, String userEmail, String type) {
        this.amount = amount;
        this.category = category;
        this.date = date;
        this.userEmail = userEmail;
        this.type = type;
    }

    // Getters
    public Long getId() { return id; }
    public double getAmount() { return amount; }
    public String getCategory() { return category; }
    public LocalDate getDate() { return date; }
    public String getUserEmail() { return userEmail; }
    public String getType() { return type; }

    // Setters
    public void setAmount(double amount) { this.amount = amount; }
    public void setCategory(String category) { this.category = category; }
    public void setDate(LocalDate date) { this.date = date; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public void setType(String type) { this.type = type; }
}