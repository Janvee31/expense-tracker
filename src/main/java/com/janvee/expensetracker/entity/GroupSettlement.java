package com.janvee.expensetracker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "group_settlements")
public class GroupSettlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "group_id", nullable = false)
    private FamilyGroup group;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "debtor_id", nullable = false)
    private User debtor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creditor_id", nullable = false)
    private User creditor;

    private double amount; // amount settled in base currency (INR)

    private LocalDate date;

    public GroupSettlement() {}

    public GroupSettlement(FamilyGroup group, User debtor, User creditor, double amount, LocalDate date) {
        this.group = group;
        this.debtor = debtor;
        this.creditor = creditor;
        this.amount = amount;
        this.date = date;
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

    public User getDebtor() {
        return debtor;
    }

    public void setDebtor(User debtor) {
        this.debtor = debtor;
    }

    public User getCreditor() {
        return creditor;
    }

    public void setCreditor(User creditor) {
        this.creditor = creditor;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
