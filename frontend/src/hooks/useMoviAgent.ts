import { useState, useEffect } from "react";
import { invokeAgent } from "@/services/api";
import { Message } from "@/types";

// Helper function to handle Text-to-Speech
const speak = (text: string) => {
  // Check if the browser supports the SpeechSynthesis API
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech to prevent overlap
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // You can configure voice, pitch, rate here if desired
    // utterance.voice = window.speechSynthesis.getVoices()[0]; 
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Text-to-Speech is not supported in this browser.");
  }
};

export const useMoviAgent = (initialMessages: Message[] = []) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- NEW: useEffect for Text-to-Speech ---
  useEffect(() => {
    // Get the last message in the history
    const lastMessage = messages[messages.length - 1];

    // If the last message exists and is from the assistant, speak it
    if (lastMessage && lastMessage.role === 'assistant') {
      speak(lastMessage.content);
    }

    // Cleanup function to stop speech if the component unmounts
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [messages]); // This effect runs whenever the messages array changes

  const sendMessage = async (
    userInput: string,
    currentPage: string,
    image: string | null = null
  ) => {
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
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, something went wrong. Please check the console.",
      };
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