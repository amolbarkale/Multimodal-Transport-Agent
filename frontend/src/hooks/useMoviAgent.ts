import { useState } from "react";
import { invokeAgent } from "@/services/api";
import { Message } from "@/types"; // Make sure this import is correct

export const useMoviAgent = (initialMessages: Message[] = []) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sendMessage = async (
    userInput: string,
    currentPage: string,
    image: string | null = null
  ) => {
    if (!userInput.trim() && !image) return;

    // Create the user message with the image property, conforming to the updated Message type
    const userMessage: Message = {
      role: "user",
      content: userInput,
      image: image,
    };
    
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