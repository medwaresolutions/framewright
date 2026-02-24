"use client";

import React, { createContext, useContext, useState } from "react";

export interface FocusedField {
  fieldId: string;
  fieldLabel: string;
  fieldDescription: string;
  step: number;
}

interface ChatContextValue {
  focusedField: FocusedField | null;
  setFocusedField: (field: FocusedField | null) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [focusedField, setFocusedField] = useState<FocusedField | null>(null);

  return (
    <ChatContext.Provider value={{ focusedField, setFocusedField }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
}
