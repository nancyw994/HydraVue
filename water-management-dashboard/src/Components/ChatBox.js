import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      type: 'system',
      text: 'You are a highly experienced irrigation AI. Provide short, practical advice...'
    },
    {
      type: 'user',
      text: 'hi'
    },
    {
      type: 'assistant',
      text: "Sorry, I couldn't generate a response."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI("AIzaSyCESYMiKa5rTQLP2h1A8fDWUkQH73RRFzk");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const farmingContext = `As an agricultural AI assistant specialized in irrigation, consider:
      - Current weather conditions and forecasts
      - Soil moisture levels and requirements
      - Crop type and growth stage
      - Water conservation methods
      - Sustainable farming practices
      
      Provide practical, specific advice for: ${userMessage}`;

      const result = await model.generateContent(farmingContext);
      const response = await result.response;
      
      setMessages(prev => [...prev, { type: 'assistant', text: response.text() }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, { 
        type: 'assistant', 
        text: "Sorry, I couldn't generate a response."
      }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#A3C4BC]"
         style={{
           background: 'rgba(255, 255, 255, 0.95)',
           backdropFilter: 'blur(8px)',
         }}>
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-[#A3C4BC]">
        <MessageSquare size={20} className="text-[#62958D]" />
        <h2 className="text-lg font-semibold text-[#2C4D47]">Chat with AI</h2>
      </div>

      {/* Messages */}
      <div className="max-h-[400px] overflow-y-auto px-4">
        <div className="text-right mb-4">
          <span className="text-xs text-[#5C7972] mb-1 block">SYSTEM</span>
          <p className="text-sm text-[#2C4D47]">
            You are a highly experienced irrigation AI. Provide short, practical advice...
          </p>
        </div>

        <div className="mb-4">
          <span className="text-xs text-[#5C7972] mb-1 block">USER</span>
          <p className="text-sm text-[#2C4D47]">
            hi
          </p>
        </div>

        <div className="mb-4">
          <span className="text-xs text-[#5C7972] mb-1 block">ASSISTANT</span>
          <p className="text-sm text-[#2C4D47]">
            Sorry, I couldn't generate a response.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-[#5C7972] mb-4">
            <div className="animate-spin h-4 w-4 border-2 border-[#62958D] border-t-transparent rounded-full"></div>
            <span className="text-sm">Thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#A3C4BC]">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about irrigation..."
            className="flex-1 px-4 py-2 text-sm bg-white border border-[#A3C4BC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#62958D]"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#62958D] text-white px-6 py-2 rounded-lg hover:bg-[#4B746E] disabled:opacity-50 text-sm font-medium"
          >
            SEND
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;