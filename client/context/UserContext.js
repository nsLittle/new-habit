import * as SecureStore from "expo-secure-store";
import React, { createContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserProvider = ({ children }) => {
  const [userContext, setUserContext] = useState({
    userName: null,
    userId: null,
    habitId: null,
    habitinput: null,
    descriptioninput: null,
    teamMemberId: null,
    firstName: null,
    lastName: null,
    email: null,
    profilePic: null,
    token: null,
  });

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const storedData = await AsyncStorage.multiGet([
          "userName",
          "userId",
          "firstName",
          "lastName",
          "email",
          "profilePic",
          "habitId",
          "habitinput",
          "descriptioninput",
          "teamMemberId",
          "teammemberFirstName",
          "teammmeberProfliePic",
        ]);

        const userInfo = Object.fromEntries(storedData);

        let storedToken = null;
        if (Platform.OS !== "web") {
          storedToken = await SecureStore.getItemAsync("token");
        }

        console.log("Loaded Token:", storedToken);

        setUserContext((prev) => ({
          ...prev,
          ...userInfo,
          token: storedToken || prev.token,
        }));
      } catch (error) {
        console.error("Error retrieving user context: ", error);
      }
    };

    loadUserInfo();
  }, []);

  useEffect(() => {
    const saveUserInfo = async () => {
      try {
        if (!userContext.userId) return;

        const userStorageData = [
          ["userId", userContext.userId || ""],
          ["userName", userContext.userName || ""],
          ["habitId", userContext.habitId || ""],
          ["habitinput", userContext.habitinput || ""],
          ["teamMemberId", userContext.teamMemberId || ""],
          ["teammemberFirstName", userContext.teammemberFirstName || ""],
          ["teammemberProfilePic", userContext.teammemberProfilePic || ""],
          ["firstName", userContext.firstName || ""],
          ["lastName", userContext.lastName || ""],
          ["email", userContext.email || ""],
          ["profilePic", userContext.profilePic || ""],
        ];

        await AsyncStorage.multiSet(userStorageData);

        if (Platform.OS !== "web") {
          if (userContext.token) {
            await SecureStore.setItemAsync("token", userContext.token);
          } else {
            await SecureStore.deleteItemAsync("token");
          }
        }
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
