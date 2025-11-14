import { useState, useEffect, useRef } from "react";
import { invokeAgent } from "@/services/api";
import { Message } from "@/types";

const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
};

export const useMoviAgent = (initialMessages: Message[] = [], isTtsEnabled: boolean) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const lastSpokenMessageId = useRef<number | null>(null);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const lastMessageIndex = messages.length - 1;

    // Do not speak the initial greeting message (index 0).
    if (isTtsEnabled && lastMessage && lastMessage.role === 'assistant' && lastSpokenMessageId.current !== lastMessageIndex && lastMessageIndex > 0) {
      speak(lastMessage.content);
      lastSpokenMessageId.current = lastMessageIndex;
    }
  }, [messages, isTtsEnabled]);

  const sendMessage = async (userInput: string, currentPage: string, image: string | null = null) => {
    // ... (This function is correct and remains unchanged)
    if (!userInput.trim() && !image) return;
    const userMessage: Message = { role: "user", content: userInput, image: image };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    try {
      const assistantResponse = await invokeAgent([...messages, userMessage], currentPage, image);
      setMessages(prev => [...prev, assistantResponse]);
    } catch (error) {
      const errorMessage: Message = { role: "assistant", content: "Sorry, an error occurred." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, sendMessage };
};