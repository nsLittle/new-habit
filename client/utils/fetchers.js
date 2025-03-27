import { BASE_URL } from "../constants/config";

export const retrieveProfile = async (username, token) => {
  try {
    const response = await fetch(`${BASE_URL}/user/${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "We can't find you.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("retrieveProfile error:", error.message);
    throw error;
  }
};
