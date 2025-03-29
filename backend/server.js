require('dotenv').config({path:'../.env'});
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

// Data Base

const db= mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME
});

const getCourseByCRN = (crn) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM Courses C, Prof_Ratings P WHERE P.Instructor = C.Instructor AND P.instructor in (SELECT instructor FROM Courses WHERE crn = ?) ";
        db.query(sql, [crn], (err, results) => {
            if (err) {
                console.error("DB error in getCourseByCRN:", err);
                return reject(err);
            }
            resolve(results[0] || null);
        });
    });
};



// Chat
app.post("/chat", async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ error: "Query is required" });
    }

    try {
        console.log(`[${new Date().toTimeString().split(' ')[0]}] Processing: "${query}"`);

        const thread = await openai.beta.threads.create();

        const message = await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: query,
        });

        const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
            assistant_id: process.env.ASSISTANT_API_KEY,
        });

        if (run.status === "completed") {

            const messages = await openai.beta.threads.messages.list(run.thread_id);

            const responses = messages.data
                .filter((message) => message.role === "assistant")
                .map((message) => message.content[0]?.text?.value || "");

            console.log("Finised: OK");
            
    
            
            let crns = [];

            try {
                // Parse the first response as JSON
                const parsed = JSON.parse(responses[0]); // assuming assistant returns one big JSON string
                crns = parsed.classes.map((c) => c.crn).filter(Boolean);
            } catch (err) {
                console.error("❌ Failed to parse assistant response:", responses[0]);
                return res.status(500).json({ error: "Invalid assistant response format" });
            }
            
            if (crns.length === 0) {
                return res.status(404).json({ error: "No CRNs found in assistant response" });
            }
            
            // Query the database for each CRN
            const courseResults = await Promise.all(
                crns.map((crn) =>
                    getCourseByCRN(crn).catch((err) => {
                        console.error(`Error querying CRN ${crn}:`, err);
                        return null;
                    })
                )
            );
            
            const courses = courseResults.filter(Boolean);
            return res.json(courses);
            
        } else {
            console.log(`Finised: ${run.status}`);
            return res.status(200).json({ status: run.status });
        }
    } catch (error) {
        console.error("Error with OpenAI API:", error);
        return res.status(500).json({ error: "Failed to process the query" });
    }
    
});

app.get("/",(re,res)=> {
    return res.json("From backend side");
});

app.listen(40006,()=>{
    console.log("listening");
});
