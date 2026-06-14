# DECISIONS.md - Decision Log

This log lists the architectural and product decisions made during this shared flatmate expenses development window, detailing the options considered and why we chose them.

---

### **1. Staging Cache Database Table vs In-Memory Imports**
* **Context:** Users want to approve duplicate merges or deletions, and we must report anomalies.
* **Options considered:**
  * **Option A (In-memory stage):** Keep uploaded CSV in frontend state or Spring Session.
  * **Option B (Database table cache - Stage):** Write a dedicated relational table `import_cache` to store rows, values, and flags.
* **Chosen Option:** **Option B (Database table cache)**. Roommates can collaborate; users can log in from their own device, navigate to the group's "CSV Importer" tab, see the staged anomalies flagged by the backend, and clean them up. Frontend state would be lost on refresh or logout.

---

### **2. Date-Bound Membership Timeline vs Static Member Splits**
* **Context:** A member moving in later objects to paying for bills logged before they joined.
* **Options considered:**
  * **Option A (Manual split exclusion):** Rely on users manually unchecking members when posting.
  * **Option B (Membership Timeline):** Store `joinedDate` and `leftDate` in a join entity (`GroupMembership`) and filter splits programmatically by checking `expense.date` against active ranges.
* **Chosen Option:** **Option B (Membership Timeline)**. This automates validation, ensuring roommate timeline fairness (bills automatically bypass users who were not active during the expense period).

---

### **3. Multicurrency Exchange Resolution**
* **Context:** Some trip expenses were paid in dollars, which the old sheet incorrectly treated as local currency.
* **Options considered:**
  * **Option A (Live API):** Fetch current exchange rates from a live converter.
  * **Option B (Historical Rate Service):** Use a fixed historical trip conversion rate of **₹83/$1**.
* **Chosen Option:** **Option B (Historical Rate Service)**. Live APIs would pull today's exchange rate, which is incorrect for historical trip spending. Roommates agree on fixed trip rates beforehand. Storing a standard rate of ₹83/$1 resolves the currency discrepancy and ensures calculation consistency.

---

### **4. Greedy cash-flow minimization vs Bilateral Debts**
* **Context:** Roommates want a single optimized transfer list showing who pays whom, but also need detailed transaction traces to prevent unverified "magic numbers".
* **Options considered:**
  * **Option A (Bilateral debts):** Maintain individual balances (e.g. User A owes User B, User B owes User C).
  * **Option B (Transaction Minimization + Audit Ledgers):** Run a cash flow minimization algorithm for a final payment summary, but store complete transaction traces.
* **Chosen Option:** **Option B**. Satisfies both requirements. Roommates get a single optimized transfer list ("Who pays whom, how much") and can audit exactly which splits, payments, and settlements add up to their net balance.
