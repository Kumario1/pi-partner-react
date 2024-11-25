import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatHistoryItem {
  problem: string;
  explanation: string;
}

interface ChatHistoryContextType {
  chatHistory: ChatHistoryItem[];
  addChatHistory: (chat: ChatHistoryItem) => void;
}

export const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

interface ChatHistoryProviderProps {
  children: ReactNode;
}

export const ChatHistoryProvider: React.FC<ChatHistoryProviderProps> = ({ children }) => {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);

  const addChatHistory = (chat: ChatHistoryItem) => {
    setChatHistory((prevHistory) => [...prevHistory, chat]);
  };

  return (
    <ChatHistoryContext.Provider value={{ chatHistory, addChatHistory }}>
      {children}
    </ChatHistoryContext.Provider>
  );
};

// Custom hook for consuming the context
export const useChatHistory = (): ChatHistoryContextType => {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
};
