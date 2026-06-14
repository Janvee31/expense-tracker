package com.janvee.expensetracker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "group_expenses")
public class GroupExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "group_id", nullable = false)
    private FamilyGroup group;

    private String description;

    private double totalAmount;

    private String currency; // e.g., "INR" or "USD"

    private double exchangeRateToBase; // e.g., 83.0 if USD to INR, or 1.0 for INR

    private LocalDate date;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "payer_id", nullable = false)
    private User payer;

    @OneToMany(mappedBy = "groupExpense", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<GroupExpenseSplit> splits = new ArrayList<>();

    public GroupExpense() {}

    public GroupExpense(FamilyGroup group, String description, double totalAmount, String currency, double exchangeRateToBase, LocalDate date, User payer) {
        this.group = group;
        this.description = description;
        this.totalAmount = totalAmount;
        this.currency = currency;
        this.exchangeRateToBase = exchangeRateToBase;
        this.date = date;
        this.payer = payer;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FamilyGroup getGroup() {
        return group;
    }

    public void setGroup(FamilyGroup group) {
        this.group = group;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public double getExchangeRateToBase() {
        return exchangeRateToBase;
    }

    public void setExchangeRateToBase(double exchangeRateToBase) {
        this.exchangeRateToBase = exchangeRateToBase;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public User getPayer() {
        return payer;
    }

    public void setPayer(User payer) {
        this.payer = payer;
    }

    public List<GroupExpenseSplit> getSplits() {
        return splits;
    }

    public void setSplits(List<GroupExpenseSplit> splits) {
        this.splits = splits;
    }
}
