"use client";
import { useState } from "react";
import { FiSend } from "react-icons/fi";

export default function LiveChat() {
  const [messages, setMessages] = useState([
    { from: "support", text: "Hello! How can we help you today?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    setInput("");
    // Here you’d call API to send message
  };

  return (
    <main className="bg-[#10141c] min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800 text-white font-bold">
        Live Chat Support
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.from === "user"
                ? "bg-blue-600 text-white self-end ml-auto"
                : "bg-[#181d2b] text-gray-200"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-800 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-[#181d2b] text-white rounded-lg px-3 py-2 outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500"
        >
          <FiSend className="text-white" />
        </button>
      </div>
    </main>
  );
}
