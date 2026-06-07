package com.janvee.expensetracker.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "leftover_debts")
public class LeftoverDebt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String debtor;
    private String creditor;
    private double amount;

    @ManyToOne
    @JoinColumn(name = "outing_id")
    @JsonIgnore
    private Outing outing;

    public LeftoverDebt() {}

    public LeftoverDebt(String debtor, String creditor, double amount, Outing outing) {
        this.debtor = debtor;
        this.creditor = creditor;
        this.amount = amount;
        this.outing = outing;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDebtor() {
        return debtor;
    }

    public void setDebtor(String debtor) {
        this.debtor = debtor;
    }

    public String getCreditor() {
        return creditor;
    }

    public void setCreditor(String creditor) {
        this.creditor = creditor;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public Outing getOuting() {
        return outing;
    }

    public void setOuting(Outing outing) {
        this.outing = outing;
    }
}
