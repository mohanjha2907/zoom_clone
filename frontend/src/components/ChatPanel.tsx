import { ChatMessage } from '@/types';
import { X, Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ChatPanelProps {
  messages: ChatMessage[];
  onClose: () => void;
  onSendMessage: (msg: string) => void;
}

export default function ChatPanel({ messages, onClose, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-[#1a1a1a] border-l border-gray-200 dark:border-gray-800 flex flex-col shadow-xl flex-shrink-0">
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <h3 className="font-semibold text-gray-900 dark:text-white">Meeting Chat</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="font-medium text-sm text-gray-900 dark:text-gray-200">{msg.sender}</span>
              <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div className="bg-gray-100 dark:bg-[#2a2a2a] p-3 rounded-lg rounded-tl-none text-sm text-gray-800 dark:text-gray-200">
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
        <form onSubmit={handleSend} className="relative">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type message here..." 
            className="w-full px-3 py-2 pr-10 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] border-none text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-zoom-blue resize-none h-20"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="absolute bottom-2 right-2 p-1.5 rounded-md bg-zoom-blue text-white disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
