# AI_USAGE.md - AI Tool Usage Log

This log documents the AI tools used during development, key prompts, and cases where the AI generated incorrect logic and how it was corrected.

---

### **1. AI Tools Used**
* **Primary Developer AI:** Antigravity (Advanced Agentic Coding Agent).
* **Model Selection:** Gemini 3.5 Flash (Medium).

---

### **2. Case Studies of AI Corrections**

#### **Case 1: CSV Splitter Breaking on Quoted Commas**
* **What the AI generated:** Initially, the CSV parser used a simple `line.split(",")` to extract values.
* **Why it was wrong:** Roommate splits columns often package comma-separated strings inside double quotes (e.g. `"Rohan, Sam, Meera"` in the Shared With column). A simple comma split broke these rows into 10+ columns, causing index errors.
* **How it was fixed:** Upgraded the parsing splitter regex in `CsvImportService.java` to:
  `line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)")`
  This ignores commas located inside quote enclosures.

#### **Case 2: Bilateral Group Access Loss on Member Leaving**
* **What the AI generated:** The leave endpoint removed the user completely from `user.getFamilyGroups()` and deleted the group if empty.
* **Why it was wrong:** If Meera leaves the group at the end of March, removing her relationship completely from the database means she can no longer log in to view the historical dashboard or approve duplicate merges.
* **How it was fixed:** Kept the database user linked to the group but introduced a `leftDate` on `GroupMembership`. The leave endpoint simply marks `leftDate = LocalDate.now()` to indicate inactive split participation while retaining historical context.

#### **Case 3: Floating Point Precision Loops in Settlement Minimization**
* **What the AI generated:** Simple greedy minimization loop subtracting double values.
* **Why it was wrong:** Floating-point subtraction causes tiny precision offsets (e.g., net balance of `0.000000000004` instead of `0`). This caused the while-loop to run infinitely or log settlement paths for zero amounts.
* **How it was fixed:** Added rounding checks using `Math.round(val * 100.0) / 100.0` at each balance iteration step and added a convergence check threshold `Math.abs(minVal) < 0.01` to cleanly break out of the cash flow minimization.
