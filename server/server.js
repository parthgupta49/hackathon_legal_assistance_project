const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { PythonShell } = require("python-shell");
const fs = require('fs');
const multer = require("multer");
// Configure multer for file uploads
const upload = multer({ dest: "uploads/" }); // Files will be saved in the "uploads" folder
const { spawn } = require('node:child_process');
const app = express();
const port = 3001;

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session management
const sessions = new Map();

// Create a new session
app.post("/create_session", (req, res) => {
    const sessionId = Math.random().toString(36).substring(7);
    sessions.set(sessionId, {});
    res.json({ session_id: sessionId });
});

const { exec } = require('node:child_process');

app.post("/upload", upload.single("file"), (req, res) => {
    const { session_id } = req.query; // Get session_id from query params
    const file = req.file; // Uploaded file

    console.log("Received upload request for session:", session_id);
    console.log("Uploaded file details:", file);

    if (!sessions.has(session_id)) {
        console.error("Session not found:", session_id);
        return res.status(404).json({ error: "Session not found" });
    }

    if (!file) {
        console.error("No file uploaded");
        return res.status(400).json({ error: "No file uploaded" });
    }

    // Call the Python script using exec
    const command = `python document_qa.py ${session_id} upload ${file.path}`;
    console.log("Executing command:", command);

    // exec(command, (error, stdout, stderr) => {
    //     if (error) {
    //         console.error("Python script error:", error.message);
    //         return res.status(500).json({ error: error.message });
    //     }

    //     if (stderr) {
    //         console.error("Python script stderr:", stderr);
    //         return res.status(500).json({ error: stderr });
    //     }

    //     console.log("Python script stdout:", stdout);

    //     // Clean up the uploaded file
    //     fs.unlink(file.path, (err) => {
    //         if (err) {
    //             console.error("Error deleting file:", err);
    //         } else {
    //             console.log("Deleted file:", file.path);
    //         }
    //     });

    //     res.json({ status: "File processed successfully", results: stdout });
    // });
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error("Python script error:", error.message);
            return res.status(500).json({ error: error.message });
        }

        // Log stderr (Python logs)
        if (stderr) {
            console.error("Python script logs:", stderr);
        }

        // Log stdout (Python print output)
        if (stdout) {
            console.log("Python script output:", stdout);
        }


        // Clean up the uploaded file
        fs.unlink(file.path, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            } else {
                console.log("Deleted file:", file.path);
            }
        });

        // Send the response back to the client
        res.json({ status: "File processed successfully", results: stdout });
    });
});

// Ask a question
// app.post("/ask", (req, res) => {
//     const { session_id, question } = req.body;

//     console.log("Received question request for session:", session_id);
//     console.log("Question:", question);

//     if (!sessions.has(session_id)) {
//         console.error("Session not found:", session_id);
//         return res.status(404).json({ error: "Session not found" });
//     }

//     // Call the Python script using exec
//     const command = `python document_qa.py ${session_id} ask "${question}"`;
//     console.log("Executing command:", command);

//     exec(command, (error, stdout, stderr) => {
//         if (error) {
//             console.error("Python script error:", error.message);
//             return res.status(500).json({ error: error.message });
//         }

//         // Log stdout (Python logs and output)
//         if (stdout) {
//             console.log("Python script output:", stdout);
//         }

//         try {
//             // Parse the JSON response from the Python script
//             const response = stdout;

//             // Send the response back to the client

//             return res.json({ answer: response });
//         } catch (e) {
//             console.error("Error parsing Python script output:", e);
//             return res.status(500).json({ error: "Failed to parse Python script output" });
//         }
//     });
// });

app.post("/ask", (req, res) => {
    const { session_id, question } = req.body;

    console.log("Received question request for session:", session_id);
    console.log("Question:", question);

    if (!sessions.has(session_id)) {
        console.error("Session not found:", session_id);
        return res.status(404).json({ error: "Session not found" });
    }

    // Call the Python script using exec
    const command = `python document_qa.py ${session_id} ask "${question}"`;
    console.log("Executing command:", command);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error("Python script error:", error.message);
            return res.status(500).json({ error: error.message });
        }

        // Log stderr (Python logs)
        if (stderr) {
            console.error("Python script logs:", stderr);
        }

        // Log stdout (Python JSON response)
        if (stdout) {
            console.log("Python script output:", stdout);
        }

        try {
            // Parse the JSON response from the Python script
            const response = JSON.parse(stdout);
            console.log(response.answer)
            // Send the response back to the client
            if (response.error) {
                return res.status(500).json({ error: response.error });
            } else {
                return res.json({ answer: response });
            }
        } catch (e) {
            console.error("Error parsing Python script output:", e);
            return res.status(500).json({ error: "Failed to parse Python script output" });
        }
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});