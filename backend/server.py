import sqlite3
import pdfplumber
import docx
import io
import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
from typing import Optional
import shutil
import subprocess
import re


app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "documents.db"
UPLOAD_FOLDER = "uploaded_docs"

# ---------- Helper Functions ----------
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS user_document (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        content TEXT
    )''')
    conn.commit()
    conn.close()

def save_to_db(filename, content):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO user_document (filename, content) VALUES (?, ?)",
        (filename, content)
    )
    conn.commit()
    conn.close()

def search_documents(query: str):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT filename, content FROM user_document WHERE content LIKE ?", (f"%{query}%",))
    results = c.fetchall()
    conn.close()
    return results

async def extract_text(file: UploadFile):
    contents = await file.read()
    await file.seek(0)  # reset pointer

    if file.filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            return "".join(page.extract_text() or "" for page in pdf.pages)
    elif file.filename.endswith(".docx"):
        doc = docx.Document(io.BytesIO(contents))
        return "\n".join(p.text for p in doc.paragraphs)
    else:  # treat as text
        return contents.decode("utf-8", errors="ignore")

def format_response(text: str) -> str:
    # Remove markdown headers and keep line breaks
    text = re.sub(r'###\s*', '\n\n', text)   # headings → double line break
    text = re.sub(r'-\s*', '\n• ', text)     # bullet points → •
    text = text.replace("```python", "\n\n[Python Code]\n")
    text = text.replace("```", "\n")
    return text.strip()

def query_ollama(prompt: str):
    import subprocess, re
    try:
        result = subprocess.run(
            ["ollama", "run", "gemma:2b"],
            input=prompt,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=120
        )

        if result.returncode != 0:
            return f"Error from Ollama: {result.stderr.strip()}"

        output = result.stdout.strip()
        if not output:
            return "Error: Ollama returned no output."

        # Clean ANSI + format
        ansi_escape = re.compile(r'\x1B[@-_][0-?]*[ -/]*[@-~]')
        clean_text = ansi_escape.sub("", output)
        return format_response(clean_text)

    except subprocess.TimeoutExpired:
        return "Error: Ollama query timed out."
    except Exception as e:
        return f"Error: {str(e)}"



# ---------- API Routes ----------
@app.on_event("startup")
def startup_event():
    init_db()
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/upload")
async def upload(file: Optional[UploadFile] = File(None), prompt: Optional[str] = Form(None)):
    text = ""
    saved_filename = None

    if file:
        # Extract and save file
        text = await extract_text(file)
        saved_filename = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(saved_filename, "wb") as f:
            f.write(await file.read())
        await file.seek(0)
        save_to_db(file.filename, text)

    elif not file:
        # Fetch last document from DB
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT content FROM user_document ORDER BY id DESC LIMIT 1")
        last = cursor.fetchone()
        conn.close()
        if last:
            text = last[0]

    if not prompt or not prompt.strip():
        return {"message": f"File '{file.filename}' stored successfully!" if file else "No file uploaded."}

    # ✨ Improved prompt building
    if text.strip():
        combined_prompt = f"""
Here is the document:

{text}

Now answer the following question. 
If it is related to the document, use the document. 
If it is not related, just answer from your own knowledge:

{prompt}
"""
    else:
        # No document context, just ask Ollama directly
        combined_prompt = prompt

    ollama_response = query_ollama(combined_prompt)

    return {
        "message": "Processed prompt successfully.",
        "ollama": ollama_response
    }



@app.get("/ask/")
async def ask_question(q: str):
    results = search_documents(q)
    if not results:
        return {"answer": "No relevant information found."}
    return {"answer": results[0][1][:500]}  # limit text length