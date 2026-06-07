package com.janvee.expensetracker.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "outing_events")
public class OutingEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private double totalAmount;

    @ElementCollection
    @CollectionTable(name = "outing_event_paid_by", joinColumns = @JoinColumn(name = "event_id"))
    @MapKeyColumn(name = "participant_name")
    @Column(name = "amount_paid")
    private Map<String, Double> paidBy = new HashMap<>();

    @ElementCollection
    @CollectionTable(name = "outing_event_shared_by", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "participant_name")
    private List<String> sharedBy = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "outing_id")
    @JsonIgnore
    private Outing outing;

    public OutingEvent() {}

    public OutingEvent(String name, double totalAmount, Map<String, Double> paidBy, List<String> sharedBy, Outing outing) {
        this.name = name;
        this.totalAmount = totalAmount;
        this.paidBy = paidBy;
        this.sharedBy = sharedBy;
        this.outing = outing;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Map<String, Double> getPaidBy() {
        return paidBy;
    }

    public void setPaidBy(Map<String, Double> paidBy) {
        this.paidBy = paidBy;
    }

    public List<String> getSharedBy() {
        return sharedBy;
    }

    public void setSharedBy(List<String> sharedBy) {
        this.sharedBy = sharedBy;
    }

    public Outing getOuting() {
        return outing;
    }

    public void setOuting(Outing outing) {
        this.outing = outing;
    }
}
