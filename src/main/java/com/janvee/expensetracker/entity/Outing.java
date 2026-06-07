package com.janvee.expensetracker.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "outings")
public class Outing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String creatorEmail;

    @ElementCollection
    @CollectionTable(name = "outing_participants", joinColumns = @JoinColumn(name = "outing_id"))
    @Column(name = "participant_name")
    private List<String> participants = new ArrayList<>();

    @OneToMany(mappedBy = "outing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OutingEvent> events = new ArrayList<>();

    @OneToMany(mappedBy = "outing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LeftoverDebt> leftoverDebts = new ArrayList<>();

    private boolean settled = false;

    public Outing() {}

    public Outing(String name, String creatorEmail, List<String> participants) {
        this.name = name;
        this.creatorEmail = creatorEmail;
        this.participants = participants;
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

    public String getCreatorEmail() {
        return creatorEmail;
    }

    public void setCreatorEmail(String creatorEmail) {
        this.creatorEmail = creatorEmail;
    }

    public List<String> getParticipants() {
        return participants;
    }

    public void setParticipants(List<String> participants) {
        this.participants = participants;
    }

    public List<OutingEvent> getEvents() {
        return events;
    }

    public void setEvents(List<OutingEvent> events) {
        this.events = events;
    }

    public List<LeftoverDebt> getLeftoverDebts() {
        return leftoverDebts;
    }

    public void setLeftoverDebts(List<LeftoverDebt> leftoverDebts) {
        this.leftoverDebts = leftoverDebts;
    }

    public boolean isSettled() {
        return settled;
    }

    public void setSettled(boolean settled) {
        this.settled = settled;
    }
}
