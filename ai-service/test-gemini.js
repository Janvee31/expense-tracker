const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        
        // There is no direct listModels on genAI in some versions of SDK
        // But we can try to use a default model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("SUCCESS:", (await result.response).text());
    } catch (err) {
        console.error("FAILURE:", err.message);
    }
}

test();
