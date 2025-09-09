import React, { useState, useRef, useEffect } from "react";

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input && !file) return;

    setIsLoading(true);
    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("prompt", input);

    try {
      const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      const aiResponse = data.message?.content || JSON.stringify(data);

      setMessages((prev) => [
        ...prev,
        { role: "user", content: input || file?.name },
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
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs p-3 rounded-2xl shadow ${
                msg.role === "user"
                  ? "bg-green-500 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-gray-500 text-sm">Assistant is typing…</div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input box */}
      <div className="p-4 bg-white border-t flex items-center space-x-2">
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
          className="text-sm text-gray-600"
        />

        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-green-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message…"
          disabled={isLoading}
        />

        <button
          onClick={sendMessage}
          disabled={isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
