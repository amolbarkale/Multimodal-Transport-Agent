import { useState } from "react";
import { invokeAgent } from "../services/api";

/**
 * A custom React hook to manage the state and logic of the Movi agent chat.
 * @param {Array<Object>} [initialMessages=[]] - An optional array of initial messages.
 * @returns {Object} An object containing messages, isLoading state, and the sendMessage function.
 */

export const useMoviAgent = (initialMessages = []) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Sends a new message from the user to the agent and processes the response.
   * @param {string} userInput - The text message from the user.
   * @param {string} currentPage - The context of the current page (e.g., 'busDashboard').
   */

  const sendMessage = async (userInput, currentPage) => {
    if (!userInput.trim()) return;

    const userMessage = { role: "user", content: userInput };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    setIsLoading(true);

    try {
      const assistantResponse = await invokeAgent(newMessages, currentPage);

      setMessages((prevMessages) => [...prevMessages, assistantResponse]);
    } catch (error) {
      console.error("An error occurred while sending the message:", error);
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