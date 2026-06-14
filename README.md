# Expense Tracker Application

A full-stack, database-backed Shared Expenses App designed to manage shared flatmate costs, track membership timelines, parse inconsistent CSV sheets interactively, and optimize payment settlements.

---

## Key Features

### 1. Personal Expense Tracking
* **Secure JWT Authentication:** Registration and login module utilizing secure JWT-based sessions.
* **Premium Dashboard:** High-fidelity UI with total spending limits, monthly limit progress bars, interactive category breakdown charts, and modern SVG money ecosystem graphics.
* **Personal Transaction Ledger:** Complete CRUD capabilities for income and expense logs with custom categories and calendar date controls.
* **Dynamic Category Analysis:** Color-coded category summary cards featuring animated percentages and visual progress trackers.
* **Rule-Based Smart Analytics:** Graph-based spending projections, weekly trend comparison sheets, and rule-based insights explaining cash flow behavior.
* **AI Financial Assistant:** Interactive chat helper powered by Gemini to answer budgeting queries and offer saving tips, complete with quick prompt starters.

### 2. Roommate & Shared Expense Management
* **Shared Split Circles:** Create or join shared expense circles with persistent group invite codes.
* **Date-Bound Membership Timeline:** Manage active roommate periods. Calculations automatically exclude flatmates from shared expenses logged before they joined or after they left.
* **Flexible Split Types:** Log group transactions split dynamically using EQUAL, EXACT, or PERCENT splits.
* **USD Currency Converter:** Ingest or log international USD expenses converting automatically using a fixed historical conversion rate of **₹83/$1**.
* **Debt Minimization Summary:** Cash flow minimization algorithm running greedy optimization to settle all group debts in the fewest possible bilateral transactions.
* **No-Magic Audit Ledger:** Trace detailed, transparent logs explaining exactly which splits and transactions add up to a member's balance.
* **Interactive CSV Importer:** Parse dirty flat files, flagging **12 deliberate anomalies** (mismatching date formats, currency discrepancies, duplicates, negative numbers, settlements, non-member records) in a staging cache. Clean up data inline before committing.
* **Ingestion Report Exporter:** Downloadable text documents summarizing the anomalies detected and manual edits/merges approved.

---

## Tech Stack

* **Backend:** Java 17, Spring Boot 3.3.5, Spring Data JPA, Spring Security, JWT
* **Database:** MySQL
* **Frontend:** React 19, Vite, TailwindCSS, Axios, Framer Motion, Lucide Icons, Node.js (Runtime & Build tool)
* **AI Collaborator:** Antigravity (Gemini 3.5 Flash Model)

---

## Setup & Running Locally

### 1. Database Setup
1. Create a MySQL database named `tracker`:
   ```sql
   CREATE DATABASE tracker;
   ```
2. Open `src/main/resources/application.properties` and verify your MySQL datasource connection details:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/tracker
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```

### 2. Running the Spring Boot Backend
1. Make sure you are in the project root directory.
2. Run using Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
3. The server starts on `http://localhost:8080`.

### 3. Running the React Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontEnd
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`. Register an account, create/join a group using invite codes, set timeline dates, and upload your CSV!
