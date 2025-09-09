import React from "react";

function MessageBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-2xl shadow
        ${isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}
      >
        {content}
      </div>
    </div>
  );
}

export default MessageBubble;
// MessageBubble.jsx → formats user vs assistant messages