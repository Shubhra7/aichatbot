"use client";
import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState("");
  const [streamResponse, setStreamResponse] = useState("");

  // Normal Chat Handler
  const handleChat = async () => {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      setResponse("Error: " + error.message);
    }

    setLoading(false);
  };

  // Streaming Chat Handler
  const handleStreamChat = async () => {
    setLoading(true);
    setStreaming(true);
    setStreamResponse("");

    try {
      const res = await fetch("/api/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            setStreamResponse((prev) => prev + data.content);
          }
        }
      }
    } catch (error) {
      setStreamResponse("Error: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div className={`${styles.page} min-h-screen flex flex-col items-center p-6`}>
      {/* Title */}
      <h1 className="text-4xl font-extrabold text-white mb-6 drop-shadow-lg">
        Shubhra&apos;s <span className="text-orange-400">AI GPT</span>
      </h1>

      {/* Input */}
      <div className="w-full max-w-2xl mb-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          rows={4}
          className="w-full p-4  rounded-xl border border-gray-300 shadow-md 
                     focus:outline-none focus:ring-2 focus:ring-orange-400 
                     resize-none"
        />
      </div>

      {/* Buttons */}

          <div>
        <button 
        className=" font-semibold items-center rounded-xl bg-amber-600 hover:bg-orange-400  "
        onClick={handleChat}
        style={{padding:"10px 20px"}}>
          {loading ? "Loading...": "💬Chat"}
        </button>
        <button 
        className=" font-semibold items-center rounded-xl bg-teal-800 hover:bg-teal-700  "
        onClick={handleStreamChat}
        style={{padding:"10px 20px", margin: "5px"}}>
          {loading ? "Loading...": "⚡Power Chat"}
        </button>
      </div>

      {/* Responses */}
      <div className="w-full max-w-2xl space-y-4">
        {/* Normal Bot Response */}
        {response && (
          <div className="border border-gray-700 bg-gray-900/60 text-gray-100 
                          rounded-xl p-4 shadow-lg">
            <h2 className="font-bold text-green-400 mb-2 flex items-center gap-2">
              🤖 <span>Bot Response:</span>
            </h2>
            <p className="whitespace-pre-wrap text-gray-200 leading-relaxed">
              {response}
            </p>
          </div>
        )}

        <br />
        <br />

        {/* Streaming Response */}
        {streamResponse && (
          <div className="border border-teal-600 bg-gradient-to-r from-green-600/20 to-teal-600/20 
                          p-4 rounded-xl shadow-lg text-gray-100">
            <h2 className="font-bold text-teal-400 mb-2 flex items-center gap-2">
              ⚡ <span>Power-Chat Response:</span>
            </h2>
            <p className="whitespace-pre-wrap text-gray-200 leading-relaxed">
              {streamResponse}
            </p>
          </div>
        )}
      </div>
      <footer className="mt-10 text-sm text-gray-400 text-center">
        Built by 🚀 
        <a 
          href="https://github.com/Shubhra7" 
          target="_blank" 
          className="text-orange-400 hover:underline ml-1"
        >
          @Shubhrajit_Ghosh
        </a>
      </footer>

    </div>
  );
}
