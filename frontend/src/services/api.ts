const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Sends a message history to the Movi agent and gets the response.
 * @param {Array<Object>} messages - The history of the conversation.
 * @param {string} currentPage - The page the user is currently on (e.g., 'busDashboard').
 * @returns {Promise<Object>} - The assistant's response message.
 */
export const invokeAgent = async (messages, currentPage) => {
  try {
    const response = await fetch(`${API_BASE_URL}/invoke_agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
        currentPage: currentPage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "An unknown error occurred.");
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to invoke agent:", error);
    return {
      role: "assistant",
      content: `Sorry, I encountered an error: ${error.message}`,
    };
  }
};