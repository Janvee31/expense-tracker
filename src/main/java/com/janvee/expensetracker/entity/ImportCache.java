package com.janvee.expensetracker.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "import_cache")
public class ImportCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Column(length = 2000)
    private String description;

    private double totalAmount;

    private String currency; // "USD", "INR"

    private String date; // Raw date string

    private String payerEmail;

    @Column(length = 2000)
    private String sharedWith; // comma-separated emails/names

    private String splitType; // "EQUAL", "EXACT", "PERCENT"

    @Column(length = 2000)
    private String splitDetails; // key-value split info

    @Column(length = 4000)
    private String rawRow; // raw CSV string

    @Column(length = 4000)
    private String anomalies; // JSON string representing detected issues

    private boolean resolved = false;
    private boolean ignored = false;

    public ImportCache() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getPayerEmail() {
        return payerEmail;
    }

    public void setPayerEmail(String payerEmail) {
        this.payerEmail = payerEmail;
    }

    public String getSharedWith() {
        return sharedWith;
    }

    public void setSharedWith(String sharedWith) {
        this.sharedWith = sharedWith;
    }

    public String getSplitType() {
        return splitType;
    }

    public void setSplitType(String splitType) {
        this.splitType = splitType;
    }

    public String getSplitDetails() {
        return splitDetails;
    }

    public void setSplitDetails(String splitDetails) {
        this.splitDetails = splitDetails;
    }

    public String getRawRow() {
        return rawRow;
    }

    public void setRawRow(String rawRow) {
        this.rawRow = rawRow;
    }

    public String getAnomalies() {
        return anomalies;
    }

    public void setAnomalies(String anomalies) {
        this.anomalies = anomalies;
    }

    public boolean isResolved() {
        return resolved;
    }

    public void setResolved(boolean resolved) {
        this.resolved = resolved;
    }

    public boolean isIgnored() {
        return ignored;
    }

    public void setIgnored(boolean ignored) {
        this.ignored = ignored;
    }
}
