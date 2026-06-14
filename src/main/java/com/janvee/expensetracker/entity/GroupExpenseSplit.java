package com.janvee.expensetracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "group_expense_splits")
public class GroupExpenseSplit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_expense_id", nullable = false)
    @JsonIgnore
    private GroupExpense groupExpense;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private double shareAmount; // share in base currency (INR)

    private String splitType; // "EQUAL", "EXACT", "PERCENT"

    private double splitValue; // original exact amount or percentage value

    public GroupExpenseSplit() {}

    public GroupExpenseSplit(GroupExpense groupExpense, User user, double shareAmount, String splitType, double splitValue) {
        this.groupExpense = groupExpense;
        this.user = user;
        this.shareAmount = shareAmount;
        this.splitType = splitType;
        this.splitValue = splitValue;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public GroupExpense getGroupExpense() {
        return groupExpense;
    }

    public void setGroupExpense(GroupExpense groupExpense) {
        this.groupExpense = groupExpense;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public double getShareAmount() {
        return shareAmount;
    }

    public void setShareAmount(double shareAmount) {
        this.shareAmount = shareAmount;
    }

    public String getSplitType() {
        return splitType;
    }

    public void setSplitType(String splitType) {
        this.splitType = splitType;
    }

    public double getSplitValue() {
        return splitValue;
    }

    public void setSplitValue(double splitValue) {
        this.splitValue = splitValue;
    }
}
