import React, { createContext, useState, ReactNode } from 'react';

export interface Chat {
  id: string;
  message: string;
}

interface ChatHistoryContextProps {
  chatHistory: Chat[];
  addChat: (chat: Chat) => void;
}

export const ChatHistoryContext = createContext<ChatHistoryContextProps | null>(null);

export const ChatHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);

  const addChat = (chat: Chat) => {
    setChatHistory([...chatHistory, chat]);
  };

  return (
    <ChatHistoryContext.Provider value={{ chatHistory, addChat }}>
      {children}
    </ChatHistoryContext.Provider>
  );
};
