const aiService = require("../services/aiService");

const chat = async (req, res) => {
    console.log("Chat request received:", req.body.message);
    try {
        const { message, expenses } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "User message is required" });
        }

        const expenseContext = expenses ? `Here is the user's expense data: ${JSON.stringify(expenses)}` : "No expense data provided.";
        
        const prompt = `
            You are a helpful financial assistant for an Expense Tracker app.
            User Message: "${message}"
            ${expenseContext}
            
            Please provide a friendly and helpful response based on the message and the data provided.
        `;

        const response = await aiService.generateResponse(prompt);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const analyzeExpenses = async (req, res) => {
    try {
        const { expenses } = req.body;

        if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
            return res.status(400).json({ error: "Valid expense data is required for analysis" });
        }

        const prompt = `
            Analyze the following expense data and provide:
            1. A brief monthly summary of spending.
            2. An analysis of the top categories.
            3. 3 specific savings recommendations.
            4. Any insights into overspending.

            Expense Data: ${JSON.stringify(expenses)}

            Format the response as a JSON object with keys: "summary", "categoryAnalysis", "savingsRecommendations" (array), and "overspendingInsights".
        `;

        const rawResponse = await aiService.generateResponse(prompt);
        
        // Try to parse the JSON from the AI response
        try {
            const cleanJson = rawResponse.replace(/```json|```/g, "").trim();
            const analysis = JSON.parse(cleanJson);
            res.json(analysis);
        } catch (parseError) {
            // Fallback if AI doesn't return perfect JSON
            res.json({ rawAnalysis: rawResponse });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getHealth = (req, res) => {
    res.json({ status: "UP", service: "AI Microservice" });
};

module.exports = {
    chat,
    analyzeExpenses,
    getHealth
};
