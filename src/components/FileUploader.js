// import React, { useState } from "react";
// import axios from "axios";

// const FileUploader = ({ sessionId }) => {
//     const [file, setFile] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState("");

//     const handleFileChange = (e) => {
//         setFile(e.target.files[0]);
//     };

//     const handleUpload = async () => {
//         if (!file) {
//             alert("Please select a file first!");
//             return;
//         }

//         setLoading(true);
//         const formData = new FormData();
//         formData.append("file", file);

//         try {
//             const response = await axios.post("http://localhost:3001/upload", formData, {
//                 headers: {
//                     "Content-Type": "multipart/form-data",
//                 },
//                 params: { session_id: sessionId }, // Pass session_id as a query parameter
//             });
//             setMessage(response.data.status);
//         } catch (error) {
//             console.error("Error uploading file:", error);
//             setMessage("Failed to upload file.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div>
//             <h2>Upload PDF</h2>
//             <input type="file" onChange={handleFileChange} accept=".pdf" />
//             <button onClick={handleUpload} disabled={loading}>
//                 {loading ? "Uploading..." : "Upload"}
//             </button>
//             {message && <p>{message}</p>}
//         </div>
//     );
// };

// export default FileUploader;

import React, { useState } from "react";
import axios from "axios";

const FileUploader = ({ sessionId, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(`${process.env.REACT_APP_LOCALHOST}/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                params: { session_id: sessionId }, // Pass session_id as a query parameter
            });
            setMessage(response.data.status);
            if (response.data.status === "File processed successfully") {
                onUploadSuccess(); // Notify parent component
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            setMessage("Failed to upload file.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center transition-colors hover:border-blue-400 group">
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf"
                    id="file-input"
                    className="hidden"
                />

                <label
                    htmlFor="file-input"
                    className="cursor-pointer flex flex-col items-center space-y-3"
                >
                    <div className="p-3 bg-slate-700 rounded-full group-hover:bg-blue-500 transition-colors">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>

                    <div className="text-slate-300 group-hover:text-blue-300 transition-colors">
                        {file ? (
                            <span className="font-medium">{file.name}</span>
                        ) : (
                            <>
                                <span className="font-medium">Click to upload</span>
                                <p className="text-sm text-slate-400 mt-1">or drag and drop PDF files</p>
                            </>
                        )}
                    </div>
                </label>
            </div>

            <button
                onClick={handleUpload}
                disabled={loading}
                className="w-fit border px-5 py-2 rounded-xl   hover:bg-green-700 disabled:bg-slate-700 font-medium transition-all flex items-center justify-center space-x-2"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Uploading...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Analyze Documents</span>
                    </>
                )}
            </button>

            {message && (
                <div className={`p-3 rounded-lg ${message.type === 'error' ? 'bg-red-900/50 text-red-300' : 'bg-emerald-900/50 text-emerald-300'}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default FileUploader;