import React, { useState } from "react";

function MessageInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <div className="flex items-center p-4 border-t bg-white">
      <input
        className="flex-1 border rounded-lg px-3 py-2 mr-2 focus:outline-none"
        type="text"
        value={text}
        placeholder="Send a message..."
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button
        onClick={handleSend}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
      >
        Send
      </button>
    </div>
  );
}

export default MessageInput;
// MessageInput.jsx → has the text input + send button