import React, { useState } from "react";
import SessionManager from "./components/SessionManager";
import FileUploader from "./components/FileUploader";
import QuestionAsker from "./components/QuestionAsker";
import "./App.css";

function App() {
    const [sessionId, setSessionId] = useState("");
    const [fileProcessed, setFileProcessed] = useState(false);

    const handleNewSession = (newSessionId) => {
        setSessionId(newSessionId); // Set the new session ID
        setFileProcessed(false); // Reset the file processed state
    };

    return (
        <div className="App">
            <h1>AI-Driven Legal Assistant Chatbot</h1>
            <SessionManager setSessionId={handleNewSession} />
            {sessionId && (
                <>
                    <FileUploader sessionId={sessionId} onUploadSuccess={() => setFileProcessed(true)} />
                    {fileProcessed && <QuestionAsker sessionId={sessionId} />}
                </>
            )}
        </div>
    );
}

export default App;