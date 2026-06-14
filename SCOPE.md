# SCOPE.md - Anomaly Log & Database Schema

This document details the database schema and our policy logs for parsing dirty CSV records from `expenses_export.csv`.

---

## 1. Relational Database Schema (MySQL)

All features are backed strictly by relational structures with foreign keys:

```mermaid
erDiagram
    USERS {
        Long id PK
        String email UK
        String password
        String profileIcon
    }
    FAMILY_GROUPS {
        Long id PK
        String name
        String inviteCode UK
    }
    GROUP_MEMBERSHIPS {
        Long id PK
        Long user_id FK
        Long family_group_id FK
        LocalDate joinedDate
        LocalDate leftDate
    }
    GROUP_EXPENSES {
        Long id PK
        Long group_id FK
        String description
        double totalAmount
        String currency
        double exchangeRateToBase
        LocalDate date
        Long payer_id FK
    }
    GROUP_EXPENSE_SPLITS {
        Long id PK
        Long group_expense_id FK
        Long user_id FK
        double shareAmount
        String splitType
        double splitValue
    }
    GROUP_SETTLEMENTS {
        Long id PK
        Long group_id FK
        Long debtor_id FK
        Long creditor_id FK
        double amount
        LocalDate date
    }
    IMPORT_CACHE {
        Long id PK
        Long group_id FK
        String description
        double totalAmount
        String currency
        String date
        String payerEmail
        String sharedWith
        String splitType
        String splitDetails
        String rawRow
        String anomalies
        boolean resolved
        boolean ignored
    }

    USERS ||--o{ GROUP_MEMBERSHIPS : has
    FAMILY_GROUPS ||--o{ GROUP_MEMBERSHIPS : contains
    FAMILY_GROUPS ||--o{ GROUP_EXPENSES : records
    USERS ||--o{ GROUP_EXPENSES : pays
    GROUP_EXPENSES ||--o{ GROUP_EXPENSE_SPLITS : splits
    USERS ||--o{ GROUP_EXPENSE_SPLITS : participates
    FAMILY_GROUPS ||--o{ GROUP_SETTLEMENTS : tracks
    USERS ||--o{ GROUP_SETTLEMENTS : settles
```

---

## 2. CSV Import Anomaly Log

Our staging parser detects **12 deliberate data problems** in the CSV. Here is how each is surfaced and handled:

| # | Anomaly | Surfaced Warning Code | Handling Policy |
|---|---|---|---|
| **1** | **Missing fields** | `MISSING_FIELD` | Surfaces row for edit. Missing critical items (payer, amount, date) block committing until resolved. |
| **2** | **Dirty/Inconsistent Date Format** | `DATE_FORMAT_INCONSISTENCY` | Evaluates formats (`dd/MM/yyyy`, `MM/dd/yyyy`, etc.), normalizes to `yyyy-MM-dd` in database. |
| **3** | **Duplicate log entries** | `DUPLICATE_ENTRY` | Scans staged cache. Highlights matching rows. Fulfills **Meera's** request: rows can be approved or ignored manually. |
| **4** | **Conflicting amounts for same item** | `CONFLICTING_AMOUNTS` | Flags same-day descriptions by same payer with mismatching costs. Meera can manually select which row to discard. |
| **5** | **Repayment logged as expense** | `SETTLEMENT_LOGGED_AS_EXPENSE` | Checks description keywords (e.g. "settle", "paid back"). Auto-converts to a direct `GroupSettlement` on approval. |
| **6** | **Currency mismatch** | `CURRENCY_DISCREPANCY` | Checks prefix symbols. Converts USD amounts to INR using our standard trip rate of **₹83/$1** (**Priya's** request). |
| **7** | **Negative amount value** | `NEGATIVE_AMOUNT` | Flags value. Handled as a reversal/credit split. |
| **8** | **Out-of-membership splits** | `OUT_OF_MEMBERSHIP_SPLIT` | Traces transaction date against `GroupMembership` timelines. Auto-excludes inactive users (e.g. March bills ignore Sam; **Sam's** request). |
| **9** | **Casing / Whitespace Casing** | `CASING_NORMALIZED` | Trims inputs and maps name fragments (e.g., "aisha" -> "aisha@gmail.com") to match DB users. |
| **10**| **Split sum mismatch** | `SPLIT_SUM_MISMATCH` | Verifies percentages sum to 100% or exact sums match total. Flagged if validation fails. |
| **11**| **Non-member participants** | `NON_MEMBER_PARTICIPANT` | Flags users included in CSV splits who do not belong to the group's registry. |
| **12**| **Zero amount** | `ZERO_AMOUNT` | Flags items costing ₹0 as potential formatting errors. |
