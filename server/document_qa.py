# import sys
# import os
# from typing import List
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain.docstore.document import Document
# from langchain_community.vectorstores import FAISS
# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_groq import ChatGroq
# from langchain.chains import ConversationalRetrievalChain
# from langchain.memory import ConversationBufferMemory
# from langchain.prompts import PromptTemplate
# from PyPDF2 import PdfReader
# from pdf2image import convert_from_path
# from PIL import Image
# from google import genai

# # Session storage (in-memory)
# sessions = {}

GROQ_API_KEY = "GROQ_API_KEY"
GOOGLE_API_KEY = "GOOGLE_API_KEY"

# class MultiDocumentQASystem:
#     def __init__(self):
#         self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
#         self.llm = ChatGroq(
#             model="llama3-8b-8192",
#             temperature=0.3,
#             groq_api_key=GROQ_API_KEY
#         )
#         self.documents = []
#         self.vectorstore = None
#         self.memory = ConversationBufferMemory(
#             memory_key="chat_history",
#             return_messages=True,
#             output_key="answer"
#         )
#         self.custom_prompt = PromptTemplate(
#             template="""
#             Use the following pieces of context including any diagrams, to answer the user's question.
#             If you don't know the answer, just say that you don't know, don't try to make up an answer.
#             Make sure you don't provide any information apart from the context.
#             Context: {context}

#             Chat History: {chat_history}

#             Question: {question}

#             Helpful Answer:""",
#             input_variables=["context", "chat_history", "question"]
#         )
#         self.retrieval_chain = None

#     def _analyze_image_with_gemini(self, image_path: str) -> str:
#         try:
#             client = genai.Client(api_key=GOOGLE_API_KEY)
#             response = client.models.generate_content(
#                 model="gemini-2.0-flash",
#                 contents=["Provide the in-depth explanation, don't miss out anything on the page", Image.open(image_path)]
#             )
#             return response.text
#         except Exception as e:
#             print(f"Image Analysis Error: {e}")
#             return ""

#     def process_pdf(self, file_path: str) -> List[Document]:
#         text_splitter = RecursiveCharacterTextSplitter(
#             chunk_size=1000,
#             chunk_overlap=200,
#             length_function=len,
#             separators=["\n\n", "\n", " ", ""]
#         )
#         with open(file_path, 'rb') as file:
#             pdf_reader = PdfReader(file)
#             text = ""
#             for page in pdf_reader.pages:
#                 text += page.extract_text()

#         pages = convert_from_path(file_path)
#         image_analyzer_text = ""
#         for page_num, page in enumerate(pages, 1):
#             try:
#                 with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
#                     page.save(temp_file.name)
#                     analysis_text = self._analyze_image_with_gemini(temp_file.name)
#                     image_analyzer_text += " " + analysis_text
#             except Exception as e:
#                 print(f"Error processing page {page_num}: {e}")

#         final_text = image_analyzer_text if len(image_analyzer_text) > len(text) else text
#         split_docs = text_splitter.split_text(final_text)
#         documents = [
#             Document(
#                 page_content=doc,
#                 metadata={"source": file_path}
#             ) for doc in split_docs
#         ]
#         return documents

#     def create_vector_store(self):
#         if not self.documents:
#             raise ValueError("No documents have been processed")
#         self.vectorstore = FAISS.from_documents(self.documents, self.embeddings)

#     def setup_retrieval_chain(self):
#         if not self.vectorstore:
#             raise ValueError("Vector store not created")
#         retriever = self.vectorstore.as_retriever(
#             search_type="mmr",
#             search_kwargs={"k": 5, "fetch_k": 50}
#         )
#         self.retrieval_chain = ConversationalRetrievalChain.from_llm(
#             llm=self.llm,
#             retriever=retriever,
#             memory=self.memory,
#             combine_docs_chain_kwargs={'prompt': self.custom_prompt},
#             output_key="answer"
#         )

#     def query_documents(self, question: str):
#         if not self.retrieval_chain:
#             raise ValueError("Retrieval chain not setup")
#         result = self.retrieval_chain.invoke({"question": question})
#         return {
#             "answer": result['answer'],
#             "sources": [
#                 {"content": doc.page_content, "source": doc.metadata.get('source', 'Unknown')}
#                 for doc in result.get('source_documents', [])
#             ]
#         }

# # Command-line interface
# if __name__ == "__main__":
#     if len(sys.argv) < 3:
#         print("Usage: python document_qa.py <session_id> <action> [file_path|question]")
#         sys.exit(1)

#     session_id = sys.argv[1]
#     action = sys.argv[2]

#     if session_id not in sessions:
#         sessions[session_id] = MultiDocumentQASystem()

#     qa_system = sessions[session_id]

#     try:
#         if action == "upload":
#             file_path = sys.argv[3]
#             docs = qa_system.process_pdf(file_path)
#             qa_system.documents.extend(docs)
#             qa_system.create_vector_store()
#             qa_system.setup_retrieval_chain()
#             print("File processed successfully")
#         elif action == "ask":
#             question = sys.argv[3]
#             response = qa_system.query_documents(question)
#             print(response['answer'])
#         else:
#             print("Invalid action")
#     except Exception as e:
#         print(f"Error: {str(e)}")

import sys
import os
from typing import List
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from PyPDF2 import PdfReader
from pdf2image import convert_from_path
from PIL import Image
from google import genai
import logging
import tempfile
import fitz  # PyMuPDF
from pdf2image.exceptions import PDFInfoNotInstalledError
import json
# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s",stream=sys.stderr )
logger = logging.getLogger(__name__)

# Session storage (in-memory)
sessions = {}

# GROQ_API_KEY = "your_groq_api_key"  # Replace with your actual key
# GOOGLE_API_KEY = "your_google_api_key"  # Replace with your actual key

class MultiDocumentQASystem:
    def __init__(self):
        logger.info("Initializing MultiDocumentQASystem")
        self.embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
        self.llm = ChatGroq(
            model="llama3-8b-8192",
            temperature=0.3,
            groq_api_key=GROQ_API_KEY
        )
        self.documents = []
        self.vectorstore = None
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key="answer"
        )
        self.custom_prompt = PromptTemplate(
            template="""
            Use the following pieces of context including any diagrams, to answer the user's question.
            Always provide the answer in detail.
            Context: {context}

            Chat History: {chat_history}

            Question: {question}

            Helpful Answer:""",
            input_variables=["context", "chat_history", "question"]
        )
        self.retrieval_chain = None

    def _analyze_image_with_gemini(self, image_path: str) -> str:
        try:
            logger.info(f"Analyzing image: {image_path}")
            client = genai.Client(api_key=GOOGLE_API_KEY)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=["Provide the in-depth explanation, don't miss out anything on the page", Image.open(image_path)]
            )
            logger.info("Image analysis completed successfully")
            return response.text
        except Exception as e:
            logger.error(f"Image Analysis Error: {e}")
            return ""

    # def process_pdf(self, file_path: str) -> List[Document]:
    #     logger.info(f"Processing PDF: {file_path}")
    #     text_splitter = RecursiveCharacterTextSplitter(
    #         chunk_size=1000,
    #         chunk_overlap=200,
    #         length_function=len,
    #         separators=["\n\n", "\n", " ", ""]
    #     )
    #     with open(file_path, 'rb') as file:
    #         pdf_reader = PdfReader(file)
    #         text = ""
    #         for page in pdf_reader.pages:
    #             text += page.extract_text()

    #     logger.info(f"Extracted text from PDF: {len(text)} characters")

    #     pages = convert_from_path(file_path)
    #     image_analyzer_text = ""
    #     for page_num, page in enumerate(pages, 1):
    #         try:
    #             with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
    #                 page.save(temp_file.name)
    #                 analysis_text = self._analyze_image_with_gemini(temp_file.name)
    #                 image_analyzer_text += " " + analysis_text
    #             logger.info(f"Processed page {page_num} successfully")
    #         except Exception as e:
    #             logger.error(f"Error processing page {page_num}: {e}")

    #     final_text = image_analyzer_text if len(image_analyzer_text) > len(text) else text
    #     logger.info(f"Final text length: {len(final_text)} characters")

    #     split_docs = text_splitter.split_text(final_text)
    #     documents = [
    #         Document(
    #             page_content=doc,
    #             metadata={"source": file_path}
    #         ) for doc in split_docs
    #     ]
    #     logger.info(f"Created {len(documents)} document chunks")
    #     return documents

    # def process_pdf(self, file_path: str) -> List[Document]:
    #     logger.info(f"Processing PDF: {file_path}")
    #     text_splitter = RecursiveCharacterTextSplitter(
    #         chunk_size=1000,
    #         chunk_overlap=200,
    #         length_function=len,
    #         separators=["\n\n", "\n", " ", ""]
    #     )
    #     # Check if the file exists
    #     if not os.path.exists(file_path):
    #         logger.error(f"File not found: {file_path}")
    #         sys.exit(1)

    #     # Extract text using PyPDF2
    #     try:
    #         with open(file_path, 'rb') as file:
    #             pdf_reader = PdfReader(file)
    #             text = ""
    #             for page in pdf_reader.pages:
    #                 text += page.extract_text()
    #         logger.info(f"Extracted text from PDF: {len(text)} characters")
    #     except Exception as e:
    #         logger.error(f"Error extracting text from PDF: {e}")
    #         sys.exit(1)

    #     # Convert PDF to images using pdf2image
    #     try:
    #         pages = convert_from_path(file_path)
    #         logger.info(f"Converted PDF to {len(pages)} pages")
    #     except Exception as e:
    #         logger.error(f"Error converting PDF to images: {e}")
    #         sys.exit(1)

    #     image_analyzer_text = ""
    #     for page_num, page in enumerate(pages, 1):
    #         try:
    #             with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
    #                 page.save(temp_file.name)
    #                 analysis_text = self._analyze_image_with_gemini(temp_file.name)
    #                 image_analyzer_text += " " + analysis_text
    #             logger.info(f"Processed page {page_num} successfully")
    #         except Exception as e:
    #             logger.error(f"Error processing page {page_num}: {e}")

    #     final_text = image_analyzer_text if len(image_analyzer_text) > len(text) else text
    #     logger.info(f"Final text length: {len(final_text)} characters")

    #     split_docs = text_splitter.split_text(final_text)
    #     documents = [
    #         Document(
    #             page_content=doc,
    #             metadata={"source": file_path}
    #         ) for doc in split_docs
    #     ]
    #     logger.info(f"Created {len(documents)} document chunks")
    #     return documents


    # def process_pdf(self, file_path: str) -> List[Document]:
    #     logger.info(f"Processing PDF: {file_path}")
    #     poppler_path = r"C:\ProgramData\chocolatey\lib\poppler\tools\Library\bin"
    #     text_splitter = RecursiveCharacterTextSplitter(
    #         chunk_size=1000,
    #         chunk_overlap=200,
    #         length_function=len,
    #         separators=["\n\n", "\n", " ", ""]
    #     )
    #     # Check if the file exists
    #     if not os.path.exists(file_path):
    #         logger.error(f"File not found: {file_path}")
    #         sys.exit(1)

    #     # Extract text using PyPDF2
    #     try:
    #         with open(file_path, 'rb') as file:
    #             pdf_reader = PdfReader(file)
    #             text = ""
    #             for page in pdf_reader.pages:
    #                 text += page.extract_text()
    #         logger.info(f"Extracted text from PDF: {len(text)} characters")
    #     except Exception as e:
    #         logger.error(f"Error extracting text from PDF: {e}")
    #         sys.exit(1)

    #     # Convert PDF to images using pdf2image
    #     try:
    #         pages = convert_from_path(file_path,poppler_path=poppler_path)
    #         logger.info(f"Converted PDF to {len(pages)} pages")
    #     except PDFInfoNotInstalledError:
    #         logger.error("Poppler is not installed or not in PATH. Please install Poppler.")
    #         sys.exit(1)
    #     except Exception as e:
    #         logger.error(f"Error converting PDF to images: {e}")
    #         sys.exit(1)

    #     image_analyzer_text = ""
    #     for page_num, page in enumerate(pages, 1):
    #         try:
    #             with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
    #                 page.save(temp_file.name)
    #                 analysis_text = self._analyze_image_with_gemini(temp_file.name)
    #                 image_analyzer_text += " " + analysis_text
    #             logger.info(f"Processed page {page_num} successfully")
    #         except Exception as e:
    #             logger.error(f"Error processing page {page_num}: {e}")

    #     final_text = image_analyzer_text if len(image_analyzer_text) > len(text) else text
    #     logger.info(f"Final text length: {len(final_text)} characters")

    #     split_docs = text_splitter.split_text(final_text)
    #     documents = [
    #         Document(
    #             page_content=doc,
    #             metadata={"source": file_path}
    #         ) for doc in split_docs
    #     ]
    #     logger.info(f"Created {len(documents)} document chunks")
    #     return documents

# now trying with differnet pdf 2 images package
    # def process_pdf(self, file_path: str) -> List[Document]:
    #     logger.info(f"Processing PDF: {file_path}")
    #     text_splitter = RecursiveCharacterTextSplitter(
    #         chunk_size=1000,
    #         chunk_overlap=200,
    #         length_function=len,
    #         separators=["\n\n", "\n", " ", ""]
    #     )
    #     # Extract text using PyPDF2
    #     try:
    #         with open(file_path, 'rb') as file:
    #             pdf_reader = PdfReader(file)
    #             text = ""
    #             for page in pdf_reader.pages:
    #                 text += page.extract_text()
    #         logger.info(f"Extracted text from PDF: {len(text)} characters")
    #     except Exception as e:
    #         logger.error(f"Error extracting text from PDF: {e}")
    #         sys.exit(1)

    #     # Convert PDF to images using PyMuPDF
    #     try:
    #         pdf_document = fitz.open(file_path)
    #         pages = []
    #         for page_num in range(len(pdf_document)):
    #             page = pdf_document.load_page(page_num)
    #             pix = page.get_pixmap()
    #             image_path = f"page_{page_num + 1}.png"
    #             pix.save(image_path)
    #             pages.append(image_path)
    #         logger.info(f"Converted PDF to {len(pages)} pages")
    #     except Exception as e:
    #         logger.error(f"Error converting PDF to images: {e}")
    #         sys.exit(1)

    #     image_analyzer_text = ""
    #     for page_num, image_path in enumerate(pages, 1):
    #         try:
    #             analysis_text = self._analyze_image_with_gemini(image_path)
    #             image_analyzer_text += " " + analysis_text
    #             logger.info(f"Processed page {page_num} successfully")
    #         except Exception as e:
    #             logger.error(f"Error processing page {page_num}: {e}")

    #     final_text = image_analyzer_text if len(image_analyzer_text) > len(text) else text
    #     logger.info(f"Final text length: {len(final_text)} characters")

    #     split_docs = text_splitter.split_text(final_text)
    #     documents = [
    #         Document(
    #             page_content=doc,
    #             metadata={"source": file_path}
    #         ) for doc in split_docs
    #     ]
    #     logger.info(f"Created {len(documents)} document chunks")
    #     return documents
    
    
 # Add this import at the top of your script

    def process_pdf(self, file_path: str) -> List[Document]:
        logger.info(f"Processing PDF: {file_path}")
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        # Extract text using PyPDF2
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
            logger.info(f"Extracted text from PDF: {len(text)} characters")
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            sys.exit(1)

        # Convert PDF to images using PyMuPDF
        try:
            pdf_document = fitz.open(file_path)
            pages = []
            for page_num in range(len(pdf_document)):
                page = pdf_document.load_page(page_num)
                pix = page.get_pixmap()
                image_path = f"page_{page_num + 1}.png"
                pix.save(image_path)
                pages.append(image_path)
            logger.info(f"Converted PDF to {len(pages)} pages")
        except Exception as e:
            logger.error(f"Error converting PDF to images: {e}")
            sys.exit(1)

        image_analyzer_text = ""
        for page_num, image_path in enumerate(pages, 1):
            try:
                analysis_text = self._analyze_image_with_gemini(image_path)
                image_analyzer_text += " " + analysis_text
                logger.info(f"Processed page {page_num} successfully")
            except Exception as e:
                logger.error(f"Error processing page {page_num}: {e}")

        # Clean up the generated image files
        for image_path in pages:
            try:
                os.remove(image_path)
                logger.info(f"Deleted image file: {image_path}")
            except Exception as e:
                logger.error(f"Error deleting image file {image_path}: {e}")

        final_text = image_analyzer_text if len(image_analyzer_text) > len(text) else text
        logger.info(f"Final text length: {len(final_text)} characters")

        split_docs = text_splitter.split_text(final_text)
        documents = [
            Document(
                page_content=doc,
                metadata={"source": file_path}
            ) for doc in split_docs
        ]
        logger.info(f"Created {len(documents)} document chunks")
        return documents

    def create_vector_store(self):
        if not self.documents:
            raise ValueError("No documents have been processed")
        logger.info("Creating vector store")
        self.vectorstore = FAISS.from_documents(self.documents, self.embeddings)
        logger.info("Vector store created successfully")

    def setup_retrieval_chain(self):
        if not self.vectorstore:
            raise ValueError("Vector store not created")
        logger.info("Setting up retrieval chain")
        retriever = self.vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={"k": 5, "fetch_k": 50}
        )
        self.retrieval_chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=retriever,
            memory=self.memory,
            combine_docs_chain_kwargs={'prompt': self.custom_prompt},
            output_key="answer"
        )
        logger.info("Retrieval chain setup complete")

    def query_documents(self, question: str):
        if not self.retrieval_chain:
            raise ValueError("Retrieval chain not setup")
        logger.info(f"Querying documents for question: {question}")
        result = self.retrieval_chain.invoke({"question": question})
        logger.info(f"Query completed successfully {result['answer']}")
        return {
            "answer": result['answer'],
            "sources": [
                {"content": doc.page_content, "source": doc.metadata.get('source', 'Unknown')}
                for doc in result.get('source_documents', [])
            ]
        }

# Save vector store to disk
def save_vector_store(vectorstore, path):
    vectorstore.save_local(path)

# Load vector store from disk
def load_vector_store(path, embeddings):
    if os.path.exists(path):
        return FAISS.load_local(
            folder_path=path,
            embeddings=embeddings,
            allow_dangerous_deserialization=True  # Add this parameter
        )
    return None



# Command-line interface
# if __name__ == "__main__":
#     if len(sys.argv) < 3:
#         print("Usage: python document_qa.py <session_id> <action> [file_path|question]")
#         sys.exit(1)

#     session_id = sys.argv[1]
#     action = sys.argv[2]

#     logger.info(f"Starting action '{action}' for session: {session_id}")

#     if session_id not in sessions:
#         sessions[session_id] = MultiDocumentQASystem()

#     qa_system = sessions[session_id]

#     try:
#         # Modify the upload and ask logic
#         if action == "upload":
#             file_path = sys.argv[3]
#             docs = qa_system.process_pdf(file_path)
#             qa_system.documents.extend(docs)
#             qa_system.create_vector_store()
#             save_vector_store(qa_system.vectorstore, "vector_store")
#             print("File processed successfully", flush=True)

#         elif action == "ask":
#             question = sys.argv[3]
#             qa_system.vectorstore = load_vector_store("vector_store", qa_system.embeddings)
#             if qa_system.vectorstore is None:
#                 print("Error: Vector store not found", flush=True)
#             else:
#                 # Reinitialize the retrieval chain
#                 qa_system.setup_retrieval_chain()
#                 response = qa_system.query_documents(question)
#                 print(json.dumps({"answer": response['answer']}), flush=True)  # Return JSON
#         else:
#             logger.error("Invalid action")
#             print("Invalid action")
#     except Exception as e:
#         logger.error(f"Error: {str(e)}")
#         print(f"Error: {str(e)}")

# if __name__ == "__main__":
#     if len(sys.argv) < 3:
#         print(json.dumps({"error": "Usage: python document_qa.py <session_id> <action> [file_path|question]"}), flush=True)
#         sys.exit(1)

#     session_id = sys.argv[1]
#     action = sys.argv[2]

#     logger.info(f"Starting action '{action}' for session: {session_id}")

#     if session_id not in sessions:
#         sessions[session_id] = MultiDocumentQASystem()

#     qa_system = sessions[session_id]

#     try:
#         if action == "upload":
#             file_path = sys.argv[3]
#             logger.info(f"Processing file: {file_path}")
#             docs = qa_system.process_pdf(file_path)
#             qa_system.documents.extend(docs)
#             qa_system.create_vector_store()
#             save_vector_store(qa_system.vectorstore, "vector_store")
#             qa_system.setup_retrieval_chain()
#             print(json.dumps({"status": "File processed successfully"}), flush=True)

#         elif action == "ask":
#             question = sys.argv[3]
#             logger.info(f"Asking question: {question}")
#             qa_system.vectorstore = load_vector_store("vector_store", qa_system.embeddings)
#             if qa_system.vectorstore is None:
#                 print(json.dumps({"error": "Vector store not found"}), flush=True)
#             else:
#                 # Reinitialize the retrieval chain
#                 qa_system.setup_retrieval_chain()
#                 response = qa_system.query_documents(question)
#                 print(json.dumps({"answer": response['answer']}), flush=True)

#         else:
#             logger.error("Invalid action")
#             print(json.dumps({"error": "Invalid action"}), flush=True)

#     except Exception as e:
#         logger.error(f"Error: {str(e)}", exc_info=True)
#         print(json.dumps({"error": str(e)}), flush=True)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python document_qa.py <session_id> <action> [file_path|question]"}), flush=True)
        sys.exit(1)

    session_id = sys.argv[1]
    action = sys.argv[2]

    logger.info(f"Starting action '{action}' for session: {session_id}")

    if session_id not in sessions:
        sessions[session_id] = MultiDocumentQASystem()

    qa_system = sessions[session_id]

    try:
        if action == "upload":
            file_path = sys.argv[3]
            logger.info(f"Processing file: {file_path}")
            docs = qa_system.process_pdf(file_path)
            qa_system.documents.extend(docs)
            qa_system.create_vector_store()
            save_vector_store(qa_system.vectorstore, "vector_store")
            qa_system.setup_retrieval_chain()
            print(json.dumps({"status": "File processed successfully"}), flush=True)

        elif action == "ask":
            question = sys.argv[3]
            logger.info(f"Asking question: {question}")
            qa_system.vectorstore = load_vector_store("vector_store", qa_system.embeddings)
            if qa_system.vectorstore is None:
                print(json.dumps({"error": "Vector store not found"}), flush=True)
            else:
                # Reinitialize the retrieval chain
                qa_system.setup_retrieval_chain()
                response = qa_system.query_documents(question)
                print(json.dumps({"answer": response['answer']}), flush=True)

        else:
            logger.error("Invalid action")
            print(json.dumps({"error": "Invalid action"}), flush=True)

    except Exception as e:
        logger.error(f"Error: {str(e)}", exc_info=True)
        print(json.dumps({"error": str(e)}), flush=True)