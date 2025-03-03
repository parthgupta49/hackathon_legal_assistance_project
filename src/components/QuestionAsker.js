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
        <div className="space-y-6">
            <div className="chat-container h-[500px] bg-slate-850 rounded-xl flex flex-col ">
                <div className="chat-window flex-1 space-y-4 overflow-y-auto pr-2 ">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}  `}
                        >
                            <div className={`max-w-[80%] p-4 rounded-2xl ${message.sender === 'user'
                                ? 'bg-blue-600 text-white ml-auto'
                                : 'bg-slate-700 text-slate-100'
                                }`}>
                                <div className="flex items-start space-x-2">
                                    {message.sender === 'bot' && (
                                        <div className="pt-1">
                                            <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-bold text-slate-900">AI</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap">{message.text}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="input-container mt-6">
                    <div className="flex space-x-4 items-center">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask about your legal documents..."
                            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                            className="flex-1 bg-slate-700 w-[20rem] rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                            onClick={handleAsk}
                            disabled={loading}
                            className="w-14 h-14 rotate-90 border bg-gray-500 hover:bg-blue-700 disabled:bg-slate-700 rounded-xl flex items-center justify-center transition-all"
                        >
                            {loading ? (
                                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionAsker;