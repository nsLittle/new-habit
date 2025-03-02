import * as SecureStore from "expo-secure-store";
import React, { createContext, useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext();

const defaultUserState = {
  userIdContext: null,
  userNameContext: null,
  firstNameContext: null,
  lastNameContext: null,
  emailContext: null,
  profilePicContext: null,
  habitContextId: null,
  habitContextInput: null,
  descriptionContextInput: null,
  teamMemberContextId: null,
  teamMemberContextFirstName: null,
  teamMemberContextProfilePic: null,
  token: null,
};

export const UserProvider = ({ children }) => {
  const [userContext, setUserContext] = useState(defaultUserState);
  const [loading, setLoading] = useState(true);

  const loadUserInfo = useCallback(async () => {
    try {
      const storedData = await AsyncStorage.multiGet(
        Object.keys(defaultUserState)
      );
      const userInfo = Object.fromEntries(
        storedData.map(([key, value]) => [
          key,
          value ? JSON.parse(value) : null,
        ])
      );

      let storedToken =
        Platform.OS !== "web" ? await SecureStore.getItemAsync("token") : null;

      setUserContext({
        ...defaultUserState,
        ...userInfo,
        token: storedToken || null,
      });
    } catch (error) {
      console.error("Error retrieving user context:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Saves user data to AsyncStorage & SecureStore
   */
  useEffect(() => {
    const saveUserInfo = async () => {
      if (!userContext.userIdContext) return; // Skip saving empty user data

      try {
        await AsyncStorage.multiSet(
          Object.entries(userContext).map(([key, value]) => [
            key,
            JSON.stringify(value ?? ""),
          ])
        );

        if (Platform.OS !== "web") {
          if (userContext.token) {
            await SecureStore.setItemAsync("token", userContext.token);
          } else {
            await SecureStore.deleteItemAsync("token");
          }
        }
      } catch (error) {
        console.error("Error saving user context:", error);
      }
    };

    if (!loading) saveUserInfo();
  }, [userContext, loading]);

  const resetUserContext = useCallback(async () => {
    try {
      await AsyncStorage.clear();
      if (Platform.OS !== "web") await SecureStore.deleteItemAsync("token");
      setUserContext(defaultUserState);
    } catch (error) {
      console.error("Error resetting user context:", error);
    }
  }, []);

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  return (
    <UserContext.Provider
      value={{ userContext, setUserContext, resetUserContext }}>
      {!loading && children}
    </UserContext.Provider>
  );
};
