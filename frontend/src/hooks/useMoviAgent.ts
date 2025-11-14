import { useState, useEffect, useRef } from "react";
import { invokeAgent } from "@/services/api";
import { Message } from "@/types";

const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Text-to-Speech is not supported in this browser.");
  }
};

export const useMoviAgent = (initialMessages: Message[] = [], isTtsEnabled: boolean) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const lastSpokenMessageId = useRef<number | null>(null);

useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const lastMessageIndex = messages.length - 1;

    // Only speak if:
    // 1. TTS is enabled.
    // 2. The last message exists and is from the assistant.
    // 3. We haven't already spoken this exact message.
    if (isTtsEnabled && lastMessage && lastMessage.role === 'assistant' && lastSpokenMessageId.current !== lastMessageIndex) {
      speak(lastMessage.content);
      // Mark this message index as spoken
      lastSpokenMessageId.current = lastMessageIndex;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [messages, isTtsEnabled]);

const sendMessage = async (
    userInput: string,
    currentPage: string,
    image: string | null = null
  ) => {
    // (This function remains unchanged)
    if (!userInput.trim() && !image) return;
    const userMessage: Message = { role: "user", content: userInput, image: image };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    try {
      const assistantResponse = await invokeAgent(newMessages, currentPage, image);
      setMessages((prevMessages) => [...prevMessages, assistantResponse]);
    } catch (error) {
      console.error("An error occurred in sendMessage:", error);
      const errorMessage: Message = { role: "assistant", content: "Sorry, something went wrong." };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
  };
};