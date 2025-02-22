import React, { useState } from 'react';
import {
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  IconButton,
  Stack
} from "@mui/material";
import { Send, MessageSquare } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const ChatBox = () => {
  const [messages, setMessages] = useState([
    {
      type: 'user',
      text: 'hi'
    },
    {
      type: 'assistant',
      text: "Hi! I am an Irrigation AI. I am really happy to provide short, practical advice with you!"
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
    <Card sx={{ 
      width: '100%',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(163, 196, 188, 0.2)',
      borderRadius: 2,
    }}>
      <CardContent sx={{ p: 2.5 }}>
        {/* 标题 */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <MessageSquare size={20} color="#62958D" />
          <Typography variant="h6" sx={{ color: '#2C4D47', fontSize: '1.1rem' }}>
            Chat with AI
          </Typography>
        </Stack>

        {/* 消息区域 */}
        <Box sx={{ 
          height: 220,
          overflow: 'auto',
          mb: 2,
          pr: 1,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#A3C4BC',
            borderRadius: '3px',
          },
        }}>
          {messages.map((message, index) => (
            <Box key={index} sx={{ mb: 1.5 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#5C7972',
                  display: 'block',
                  mb: 0.5,
                  fontWeight: 500,
                  fontSize: '0.7rem'
                }}
              >
                {message.type.toUpperCase()}
              </Typography>
              <Paper 
                elevation={0}
                sx={{ 
                  py: 1.5,
                  px: 2,
                  borderRadius: 1.5,
                  bgcolor: message.type === 'user' ? '#62958D' : 'rgba(163, 196, 188, 0.1)',
                  color: message.type === 'user' ? 'white' : '#2C4D47'
                }}
              >
                <Typography variant="body2" sx={{ 
                  fontSize: '0.875rem',
                  lineHeight: 1.5
                }}>
                  {message.text}
                </Typography>
              </Paper>
            </Box>
          ))}

          {isLoading && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              color: '#5C7972',
              p: 1.5
            }}>
              <div className="loading-dots">
                <span>●</span>
                <span>●</span>
                <span>●</span>
              </div>
            </Box>
          )}
        </Box>

        {/* 输入区域 */}
        <form onSubmit={sendMessage}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about irrigation..."
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderColor: '#A3C4BC',
                  borderRadius: 1.5,
                  '&:hover': {
                    borderColor: '#62958D',
                  },
                  '&.Mui-focused': {
                    borderColor: '#62958D',
                  }
                }
              }}
            />
            <IconButton 
              type="submit"
              disabled={isLoading}
              sx={{
                bgcolor: '#62958D',
                color: 'white',
                '&:hover': {
                  bgcolor: '#4B746E',
                },
                '&.Mui-disabled': {
                  bgcolor: '#A3C4BC',
                },
                borderRadius: 1.5,
                width: 36,
                height: 36,
                minWidth: 36
              }}
            >
              <Send size={18} />
            </IconButton>
          </Stack>
        </form>
      </CardContent>

      <style>{`
        .loading-dots {
          display: flex;
          gap: 4px;
        }
        .loading-dots span {
          font-size: 12px;
          animation: dots 1.4s infinite;
          animation-fill-mode: both;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dots {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </Card>
  );
};

export default ChatBox;