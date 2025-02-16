import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserProvider = ({ children }) => {
  const [userContext, setUserContext] = useState({
    userName: null,
    userId: null,
    habitId: null,
    teammemberId: null,
    token: null,
    firstName: null,
  });

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const storedUserName = await AsyncStorage.getItem("userName");
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedHabitId = await AsyncStorage.getItem("habitId");
        const storedTeammemberId = await AsyncStorage.getItem("teammemberId");
        const storedFirstName = await AsyncStorage.getItem("firstName");

        let storedToken = await SecureStore.getItemAsync("token");
        if (!storedToken) {
          storedToken = await AsyncStorage.getItem("token");
        }

        console.log("Loaded Token:", storedToken);

        if (storedUsername && storedUserId) {
          setUserContext({
            userName: storedUserName,
            userId: storedUserId,
            habitId: storedHabitId,
            teammemberId: storedTeammemberId,
            token: storedToken || null,
            firstName: storedFirstName,
          });
        }
      } catch (error) {
        console.error("Error retrieving user context: ", error);
      }
    };

    loadUserInfo();
  }, []);

  useEffect(() => {
    const saveUserInfo = async () => {
      try {
        if (userContext.token) {
          await SecureStore.setItemAsync("token", userContext.token);
          await AsyncStorage.setItem("token", userContext.token);
        }
        await AsyncStorage.setItem("userId", userContext.userId || "");
        await AsyncStorage.setItem("username", userContext.username || "");
        await AsyncStorage.setItem("habitId", userContext.habitId || "");
        await AsyncStorage.setItem(
          "teammemberId",
          userContext.teammemberId || ""
        );
        await AsyncStorage.setItem("firstName", userContext.firstName || "");
      } catch (error) {
        console.error("Error saving user context: ", error);
      }
    };

    saveUserInfo();
  }, [userContext]);

  return (
    <UserContext.Provider value={{ userContext, setUserContext }}>
      {children}
    </UserContext.Provider>
  );
};

export const UserContext = createContext();
