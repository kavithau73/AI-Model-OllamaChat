import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("developer");
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

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
    <div className="flex h-screen bg-gray-100">
      {/* Left panel */}
      <div className="w-1/4 p-4 bg-white border-r flex flex-col">
        <h2 className="text-lg font-semibold mb-3">Options</h2>
        <select
          className="border rounded-lg p-2 mb-3 w-full"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="developer">Mid-level Developer</option>
          <option value="senior">Senior Developer</option>
        </select>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-2"
        />
        {file && <p className="text-sm text-gray-600">File: {file.name}</p>}
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto p-4 mb-4 bg-gray-50 rounded-lg">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-2 flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`inline-block px-3 py-2 rounded-lg max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <ReactMarkdown>{`**${msg.role}:**\n\n${msg.content}`}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && <p className="text-gray-500">Assistant is typing...</p>}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg p-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            disabled={isLoading}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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

export default ChatApp;
