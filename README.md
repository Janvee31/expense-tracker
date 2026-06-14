# Expense Tracker Application

A full-stack, database-backed Shared Expenses App designed to manage shared flatmate costs, track membership timelines, parse inconsistent CSV sheets interactively, and optimize payment settlements.

---

## Key Features

1. **Secure Login Module:** User registration and JWT-based authentication.
2. **Membership Timeline History:** Set and manage member join/leave dates. Balance calculations dynamically check expense dates against active member windows (e.g. members are excluded from bills logged before they joined).
3. **Group Split Bills:** Log shared expenses with EQUAL, EXACT, or PERCENT splits. Trace calculations transparently in the Audit ledger to view exactly which splits contribute to a roommate's balance.
4. **USD Currency Converter:** Multicurrency support converting USD transactions using a fixed historical trip conversion rate of **₹83/$1**.
5. **Minimized Settlements:** Greedy Cash Flow Minimization algorithm simplifies bilateral debts into the minimum number of transactions (who pays whom, how much).
6. **Interactive CSV Importer:** Ingests dirty flat exports without manual editing. Flags **12 deliberate anomalies** (whitespace casing, duplicates, currency mismatches, out-of-membership splits, settlements) in a staging cache. Roommates can edit details or ignore duplicates before committing to the database.
7. **Import Report Generator:** Generates a downloadable text summary of detected anomalies and resolution actions.

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
