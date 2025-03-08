import "./App.css";
import React, { useEffect, useRef, useState } from "react";

function App() {
  const chatRef = useRef();
  const [messages, setMessages] = useState([
    {
      text: "Hi there! How can i help you today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");

  const updateHistory = (text) => {
    setMessages((prev) => {
      console.log("prev", prev);
      const newData = [
        ...prev.filter((i) => {
          return !(i.sender === "bot" && i.text === "thinking...");
        }),
        {
          text: text,
          sender: "bot",
        },
      ];
      console.log('newData', newData)
      return newData
    });
  };

  const genarateBotResponse = async (history) => {
    const requestOptions = {
      method: "POST",
      header: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: history }],
          },
        ],
      }),
    };

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL,
        requestOptions
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error.message || "Something went wrong!");
      }
      const apiResonse = data.candidates[0].content.parts[0].text;
      updateHistory(apiResonse);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSendMessage = async () => {
    if (input.trim()) {
      setMessages((messages) => {
        return [...messages, { text: input, sender: "user" }];
      });
      setInput("");
      // Here you can add the logic to send the message to your Telegram bot
      setMessages((messages) => {
        return [...messages, { text: "thinking...", sender: "bot" }];
      });
      await genarateBotResponse(input.trim());
    }
  };

  useEffect(() => {
    chatRef.current.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="app">
      <div className="chat-header">
        <div className="header-info">
          <h2 className="logo-text">Chatbot</h2>
        </div>
      </div>
      <div className="chat-window">
        <div className="messages" ref={chatRef}>
          {messages.map((message, index) => {
            const isBot = message.sender === "bot";
            return (
              <div className="message-container">
                {isBot ? <div className="bot-avatar">Bot</div> : null}
                <div
                  key={index}
                  className={`message-sender message-sender-${message.sender}`}
                >
                  <div className={`message message-${message.sender}`}>
                    {message.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
