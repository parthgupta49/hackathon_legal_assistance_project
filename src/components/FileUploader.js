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
            const response = await axios.post("http://localhost:3001/upload", formData, {
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
        <div className="file-uploader">
            <h2>Upload PDF</h2>
            <div className="upload-container">
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf"
                    id="file-input"
                    style={{ display: "none" }}
                />
                <label htmlFor="file-input" className="upload-button">
                    {file ? file.name : "Choose File"}
                </label>
                <button onClick={handleUpload} disabled={loading} className="upload-button">
                    {loading ? "Uploading..." : "Upload"}
                </button>
            </div>
            {message && <p className="upload-message">{message}</p>}
        </div>
    );
};

export default FileUploader;