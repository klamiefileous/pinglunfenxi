
import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, ChatMessage } from '../types';
import { GeminiService } from '../services/geminiService';

interface AIChatBotProps {
  context: AnalysisResult;
}

const AIChatBot: React.FC<AIChatBotProps> = ({ context }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    let fullText = '';
    try {
      const stream = GeminiService.chatStream(input, context);
      const modelMsg: ChatMessage = { role: 'model', text: '', isThinking: true };
      setMessages(prev => [...prev, modelMsg]);

      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            role: 'model', 
            text: fullText,
            isThinking: false
          };
          return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50">
      <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-semibold">Insight Assistant</span>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm mt-10">
            Ask me anything about your analysis results!
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none shadow-sm'
            }`}>
              {m.isThinking ? (
                <div className="flex gap-1 py-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
              ) : m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button 
          onClick={handleSend}
          disabled={isTyping}
          className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AIChatBot;
