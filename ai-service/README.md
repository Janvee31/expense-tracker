# AI Expense Microservice

This is a Node.js microservice that integrates with Google Gemini AI to provide financial insights and chat capabilities for the Expense Tracker application.

## 🚀 Features
- **AI Chat**: Discuss your finances with an AI assistant.
- **Expense Analysis**: Get monthly summaries, category breakdowns, and savings tips.
- **Beginner Friendly**: Simple Express.js structure with clean routing.

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js installed on your system.
- A Gemini API Key (Get it from [Google AI Studio](https://aistudio.google.com/)).

### 2. Installation
Navigate to the `ai-service` folder and install dependencies:
```bash
cd ai-service
npm install
```

### 3. Environment Variables
Create a `.env` file in the `ai-service` root (one has been created for you):
```env
PORT=5000
GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Running the Service
Start the server:
```bash
node src/index.js
```
The service will run at `http://localhost:5000`.

## 📡 API Endpoints

### `GET /ai/health`
Checks if the service is running.

### `POST /ai/chat`
**Body:**
```json
{
  "message": "Should I save more this month?",
  "expenses": [
    {"category": "Food", "amount": 500},
    {"category": "Travel", "amount": 200}
  ]
}
```

### `POST /ai/analyze-expenses`
**Body:**
```json
{
  "expenses": [
    {"category": "Food", "amount": 1500, "date": "2024-05-01"},
    {"category": "Shopping", "amount": 3000, "date": "2024-05-05"}
  ]
}
```

## 🔗 Connecting with Spring Boot
To call this service from your Java backend, use `RestTemplate`:

```java
RestTemplate restTemplate = new RestTemplate();
String url = "http://localhost:5000/ai/analyze-expenses";

Map<String, Object> request = new HashMap<>();
request.put("expenses", userExpenses);

ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
return response.getBody();
```
