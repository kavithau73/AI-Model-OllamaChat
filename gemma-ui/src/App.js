import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown"; // 👈 add this import

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("developer");
  const fileInputRef = useRef(null);

  const sendMessage = async () => {
    if (!input && !file) return;

    setIsLoading(true);
    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("prompt", input);
    formData.append("role", role);

    try {
      const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      const aiResponse = data.ollama || data.message || "No response.";

      setMessages((prev) => [
        ...prev,
        { role: "user", content: `[${role}] ${input || file?.name}` },
        { role: "assistant", content: aiResponse },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
      setInput("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
 <div className="flex flex-col min-h-screen w-full px-4 py-4">
  <h2 className="text-2xl font-bold mb-4 text-center">👩‍💻 Ollama Chat</h2>

  {/* Chat window */}
  <div className="flex-1 border rounded-lg p-4 overflow-y-auto bg-gray-50 mb-4 w-full max-w-[90%] mx-auto">
    {messages.map((msg, i) => (
      <div
        key={i}
        className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
      >
        <div
          className={`inline-block px-3 py-2 rounded-lg max-w-[90%] ${
            msg.role === "user"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-900"
          }`}
        >
          <ReactMarkdown>{`**${msg.role}:**\n\n${msg.content}`}</ReactMarkdown>
        </div>
      </div>
    ))}
    {isLoading && <p className="text-gray-500">Loading...</p>}
  </div>

  {/* Two-column layout */}
  <div className="flex gap-4 w-full max-w-[90%] mx-auto">
    {/* Left side */}
    <div className="flex flex-col gap-4 w-1/2">
      <div className="flex flex-col gap-1">
        <label className="font-medium">Role</label>
        <select
          className="border rounded-lg p-2 w-full"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="developer">Mid-level Developer</option>
          <option value="senior">Senior Developer</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-medium">Upload File</label>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
          className="border rounded-lg p-2"
        />
        {file && <p className="text-sm text-gray-700">Uploaded: {file.name}</p>}
      </div>
    </div>

    {/* Right side */}
    <div className="flex flex-col gap-2 w-1/2">
      <label className="font-medium">Your Question</label>
      <input
        className="border rounded-lg p-2 w-full"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something about the document..."
        disabled={isLoading}
      />
      <button
        onClick={sendMessage}
        className={`px-4 py-2 rounded-lg text-white ${
          isLoading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send"}
      </button>
    </div>
  </div>
</div>


  );
}

export default App;
