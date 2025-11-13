import { DailyTrip, Route, Vehicle, Driver, Stop, Message } from "@/types";

const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Sends a message history to the Movi agent and gets the response.
 * @param messages The history of the conversation.
 * @param currentPage The page the user is currently on (e.g., 'busDashboard').
 * @returns The assistant's response message.
 */

export const invokeAgent = async (
  messages: Message[],
  currentPage: string,
  image: string | null = null
): Promise<Message> => {
  try {
    const response = await fetch(`${API_BASE_URL}/invoke_agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, currentPage, image }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "An unknown server error occurred.");
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to invoke agent:", error);
    return {
      role: "assistant",
      content: `❌ Sorry, I encountered an error. Please try again.`,
    };
  }
};

const handleFetch = async <T>(url: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${url}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`);
  }
  return response.json();
};

export const getTrips = () => handleFetch<DailyTrip[]>("/trips");
export const getRoutes = () => handleFetch<Route[]>("/routes");
export const getVehicles = () => handleFetch<Vehicle[]>("/vehicles");
export const getDrivers = () => handleFetch<Driver[]>("/drivers");
export const getTripRouteStops = (tripId: number) => handleFetch<Stop[]>(`/trip-details/${tripId}/route-stops`);