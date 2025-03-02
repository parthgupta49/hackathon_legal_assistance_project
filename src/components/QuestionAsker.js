// import React, { useState } from "react";
// import axios from "axios";

// const QuestionAsker = ({ sessionId }) => {
//     const [question, setQuestion] = useState("");
//     const [answer, setAnswer] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleAsk = async () => {
//         if (!question) {
//             alert("Please enter a question!");
//             return;
//         }

//         setLoading(true);
//         try {
//             const response = await axios.post("http://localhost:3001/ask", {
//                 session_id: sessionId,
//                 question,
//             });
//             console.log(response)

//             // Check if the response contains the answer
//             if (response?.data && response?.data?.answer) {
//                 // const formattedAnswer = response?.data?.answer?.answer?.replace(/\n/g, "<br />");
//                 const formattedAnswer = response?.data?.answer?.answer
//                 .split("\n") // Split the answer into lines
//                 .map((line) => {
//                     if (line.trim().startsWith("**") ) {
//                         return `<strong>${line}</strong>`; // Wrap in <strong> tags
//                     }
//                     return line; // Leave other lines unchanged
//                 })
//                 .join("<br />"); // Join lines with <br /> tags
//                 setAnswer(formattedAnswer); // Set the answer

//             } else {
//                 setAnswer("No answer found in the response.");
//             }
//         } catch (error) {
//             console.error("Error asking question:", error);

//             // Handle specific error cases
//             if (error.response && error.response.data && error.response.data.error) {
//                 setAnswer(`Error: ${error.response.data.error}`);
//             } else {
//                 setAnswer("Failed to get an answer.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div>
//             <h2>Ask a Question</h2>
//             <input
//                 type="text"
//                 value={question}
//                 onChange={(e) => setQuestion(e.target.value)}
//                 placeholder="Enter your question"
//             />
//             <button onClick={handleAsk} disabled={loading}>
//                 {loading ? "Asking..." : "Ask"}
//             </button>
//             {answer && (
//                 <div>
//                     <h3>Answer:</h3>
//                     <div
//                         dangerouslySetInnerHTML={{ __html: answer }}
//                         style={{
//                             whiteSpace: "pre-wrap",
//                             lineHeight: "1.6",
//                             fontFamily: "monospace",
//                             padding: "10px",
//                             backgroundColor: "#f5f5f5",
//                             borderRadius: "5px",
//                             border: "1px solid #ddd",
//                         }}
//                     />
//                 </div>
//             )}
//         </div>
//     );
// };

// export default QuestionAsker;

import React, { useState } from "react";
import axios from "axios";

const QuestionAsker = ({ sessionId }) => {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleAsk = async () => {
        if (!question) {
            alert("Please enter a question!");
            return;
        }

        setLoading(true);
        try {
            // Add user's question to the chat
            setMessages((prev) => [...prev, { sender: "user", text: question }]);

            const response = await axios.post("http://localhost:3001/ask", {
                session_id: sessionId,
                question,
            });

            // Add bot's answer to the chat
            if (response?.data && response?.data?.answer) {
                const formattedAnswer = response.data.answer.answer
                    .split("\n")
                    .map((line, index) => (
                        <p key={index} style={{ margin: "0" }}>
                            {line.trim().startsWith("*") ? <strong>{line}</strong> : line}
                        </p>
                    ));

                setMessages((prev) => [...prev, { sender: "bot", text: formattedAnswer }]);
            } else {
                setMessages((prev) => [...prev, { sender: "bot", text: "No answer found in the response." }]);
            }
        } catch (error) {
            console.error("Error asking question:", error);
            setMessages((prev) => [...prev, { sender: "bot", text: "Failed to get an answer." }]);
        } finally {
            setLoading(false);
            setQuestion(""); // Clear the input after asking
        }
    };

    return (
        <div className="question-asker">
            <h2>Chat with the Bot</h2>
            <div className="chat-window">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.sender === "user" ? "user-message" : "bot-message"}`}
                    >
                        {message.text}
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter your question"
                    onKeyPress={(e) => e.key === "Enter" && handleAsk()}
                />
                <button onClick={handleAsk} disabled={loading}>
                    {loading ? "Asking..." : "Ask"}
                </button>
            </div>
        </div>
    );
};

export default QuestionAsker;