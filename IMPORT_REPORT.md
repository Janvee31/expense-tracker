# IMPORT_REPORT.md - Flatmate CSV Import Log

This report lists the staged CSV rows, anomalies detected by the ingestion parser, and their resolution statuses when imported.

---

## Ingestion Summary
* **Group:** Roommate Split Group (ID: 12)
* **Date:** 2026-06-15
* **Input File:** `expenses_export.csv`

---

## Log of Anomalies & Actions

| Row | Description | Amount | Currency | Flagged Anomaly | Resolution Action Taken |
|---|---|---|---|---|---|
| **1** | Electricity Bill (March) | ₹4,500.00 | INR | `OUT_OF_MEMBERSHIP_SPLIT` | **Approved.** Split dynamically recalculated to exclude Member C (joined mid-April). |
| **2** | Grocery Staples (April) | $50.00 | USD | `CURRENCY_DISCREPANCY` | **Approved.** Amount auto-converted to base currency (₹4,150.00) using historical trip conversion rate of ₹83/$1. |
| **3** | Internet Setup | ₹1,200.00 | INR | `DUPLICATE_ENTRY` | **Ignored.** Manually flagged as duplicate and discarded to prevent double-billing. |
| **4** | Settlement Payment | ₹1,200.00 | INR | `SETTLEMENT_LOGGED_AS_EXPENSE` | **Approved.** Identified keyword "paid back" and auto-converted from a normal expense into a direct settlement. |
| **5** | Gas Bill | -₹150.00 | INR | `NEGATIVE_AMOUNT` | **Approved.** Negative value parsed and recorded as a refund/credit split among active roommates. |
| **6** | Free Snack | ₹0.00 | INR | `ZERO_AMOUNT` | **Ignored.** Row discarded as it contained no split cost value. |
| **7** | Dinner Split | ₹3,000.00 | INR | `NON_MEMBER_PARTICIPANT` | **Approved.** Cleaned up split list to only include members belonging to the registered group timeline. |
| **8** | Taxi ride | ₹600.00 | INR | `DATE_FORMAT_INCONSISTENCY` | **Approved.** Normalized date format (`15/02/2026` -> `2026-02-15`) and mapped casing to match database records. |
