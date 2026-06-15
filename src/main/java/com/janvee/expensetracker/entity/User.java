package com.janvee.expensetracker.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;
    private String password;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_family_groups",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "family_group_id")
    )
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<FamilyGroup> familyGroups = new java.util.ArrayList<>();

    private String profileIcon;

    public User() {}

    public User(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public java.util.List<FamilyGroup> getFamilyGroups() {
        return familyGroups;
    }

    public String getProfileIcon() {
        return profileIcon;
    }

    // Setters
    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setFamilyGroups(java.util.List<FamilyGroup> familyGroups) {
        this.familyGroups = familyGroups;
    }

    public void setProfileIcon(String profileIcon) {
        this.profileIcon = profileIcon;
    }
}