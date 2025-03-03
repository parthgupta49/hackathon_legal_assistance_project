import React, { useState, useEffect } from "react";
import SessionManager from "./components/SessionManager";
import FileUploader from "./components/FileUploader";
import QuestionAsker from "./components/QuestionAsker";

const LegalChatbot = () => {
    const [sessionId, setSessionId] = useState("");
    const [fileProcessed, setFileProcessed] = useState(false);

    // Reset file processed state when session changes
    useEffect(() => {
        setFileProcessed(false);
    }, [sessionId]);

    return (
        <div className="min-h-screen z-10 absolute w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Legal AI Assistant
                </h1>

                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-slate-700">
                    <SessionManager setSessionId={setSessionId} />

                    {sessionId && (
                        <div className="space-y-8 mt-8">
                            <FileUploader
                                sessionId={sessionId}
                                onUploadSuccess={() => setFileProcessed(true)}
                            />

                            {fileProcessed ? (
                                <QuestionAsker sessionId={sessionId} />
                            ) : (
                                <div className="text-center text-slate-400 py-6 rounded-xl bg-slate-700/50">
                                    📁 Upload legal documents to begin analysis
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LegalChatbot;