import React, { useState } from "react";
import axios from "axios";

const SessionManager = ({ setSessionId }) => {
    const [loading, setLoading] = useState(false);
    const createSession = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_LOCALHOST}/create_session`);
            setSessionId(response.data.session_id); // Call the callback with the new session ID
        } catch (error) {
            console.error("Error creating session:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={createSession} disabled={loading} className="border">
                {loading ? "Creating Session..." : "Create New Session"}
            </button>
        </div>
    );
};

export default SessionManager;