import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Sprout } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const ChatBox = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([{
    text: "Hello! I'm your Smart Farm Assistant. I can help you with farming advice, irrigation tips, and crop management. How can I assist you today?",
    sender: 'ai'
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI("AIzaSyCESYMiKa5rTQLP2h1A8fDWUkQH73RRFzk");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const farmingContext = `As an agricultural AI assistant, consider: 
      - Sustainable farming practices
      - Water conservation methods
      - Crop health and disease prevention
      - Soil management
      - Weather impact on farming
      
      User Question: ${userMessage}`;

      const result = await model.generateContent(farmingContext);
      const response = await result.response;
      
      setMessages(prev => [...prev, { text: response.text(), sender: 'ai' }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai'
      }]);
    }

    setIsLoading(false);
  };

  return (
    <div 
      className={`fixed top-20 right-4 w-96 bg-white shadow-2xl transform transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      } z-50 flex flex-col rounded-lg overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#62958D] text-white">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Farm Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-[#4B746E] rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-[#62958D] text-white'
                    : 'bg-white border border-[#A3C4BC] text-[#2C4D47]'
                } shadow-sm`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#A3C4BC] text-[#2C4D47] max-w-[85%] p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#62958D] border-t-transparent"></div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-[#A3C4BC] p-4 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about farming, crops, or irrigation..."
            className="flex-1 border border-[#A3C4BC] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#62958D] text-[#2C4D47] placeholder-[#5C7972]"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#62958D] text-white rounded-lg px-4 py-2 hover:bg-[#4B746E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;