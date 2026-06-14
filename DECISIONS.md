# DECISIONS.md - Decision Log

This log lists the architectural and product decisions made during this 2-day shared flatmate expenses development window, detailing the options considered and why we chose them.

---

### **1. Staging Cache Database Table vs In-Memory Imports**
* **Context:** Meera wants to approve duplicate merges or deletions, and we must report anomalies.
* **Options considered:**
  * **Option A (In-memory stage):** Keep uploaded CSV in frontend state or Spring Session.
  * **Option B (Database table cache - Stage):** Write a dedicated relational table `import_cache` to store rows, values, and flags.
* **Chosen Option:** **Option B (Database table cache)**. Roommates can collaborate; Meera can log in from her own laptop, navigate to the group's "CSV Importer" tab, see the staged anomalies flagged by the backend, and clean them up. Frontend state would be lost on refresh or logout.

---

### **2. Date-Bound Membership Timeline vs Static Member Splits**
* **Context:** Sam moved in mid-April and objects to paying for March electricity.
* **Options considered:**
  * **Option A (Manual split exclusion):** Rely on users manually unchecking members when posting.
  * **Option B (Membership Timeline):** Store `joinedDate` and `leftDate` in a join entity (`GroupMembership`) and filter splits programmatically by checking `expense.date` against active ranges.
* **Chosen Option:** **Option B (Membership Timeline)**. This automates validation, ensuring roommate timeline fairness (March bills automatically bypass Sam; Meera is ignored post-March).

---

### **3. Multicurrency Exchange Resolution**
* **Context:** Priya pointed out that the trip had dollar expenses, which the old sheet treated as rupees.
* **Options considered:**
  * **Option A (Live API):** Fetch current exchange rates from a live converter.
  * **Option B (Historical Rate Service):** Use a fixed historical trip conversion rate of **₹83/$1**.
* **Chosen Option:** **Option B (Historical Rate Service)**. Live APIs would pull today's exchange rate, which is incorrect for historical trip spending from February/March. Roommates agree on fixed trip rates beforehand. Storing a standard rate of ₹83/$1 resolves Priya's issue and ensures calculation consistency.

---

### **4. Greedy cash-flow minimization vs Bilateral Debts**
* **Context:** Aisha wants one number per person showing who pays whom, whereas Rohan wants detailed trace logs to prevent "magic numbers".
* **Options considered:**
  * **Option A (Bilateral debts):** Maintain individual balances (e.g. Rohan owes Priya, Priya owes Aisha, Meera owes Rohan).
  * **Option B (Transaction Minimization + Audit Ledgers):** Run a cash flow minimization algorithm for a final payment summary, but store complete transaction traces for Rohan.
* **Chosen Option:** **Option B**. Satisfies both flatmates. Aisha gets a single optimized transfer list ("Who pays whom, how much"). Rohan can click on his name to tracing exactly which splits, payments, and settlements add up to his net balance.
