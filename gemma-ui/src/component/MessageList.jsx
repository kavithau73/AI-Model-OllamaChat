import React from "react";
import MessageBubble from "./MessageBubble";

function MessageList({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg, i) => (
        <MessageBubble key={i} role={msg.role} content={msg.content} />
      ))}
    </div>
  );
}

export default MessageList;
// MessageList.jsx → displays messages in bubbles