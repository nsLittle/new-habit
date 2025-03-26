import * as SecureStore from "expo-secure-store";
import React, { createContext, useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";

export const UserContext = createContext();

const defaultUserState = {
  userIdContext: "",
  userNameContext: "",
  firstNameContext: "",
  lastNameContext: "",
  emailContext: "",
  profilePicContext: "",
  habitContextId: "",
  habitContextInput: "",
  descriptionContextInput: "",
  endDate: "",
  teamMemberContextId: "",
  teamMemberContextFirstName: "",
  teamMemberContextProfilePic: "",
  token: "",
};

export const UserProvider = ({ children }) => {
  const [userContext, setUserContext] = useState(defaultUserState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saveUserInfo = async () => {
      if (!userContext || !userContext.userIdContext) return;

      try {
        if (Platform.OS !== "web") {
          if (userContext.token) {
            await SecureStore.setItemAsync("token", userContext.token);
          } else {
            await SecureStore.deleteItemAsync("token");
          }
        }
      } catch (error) {
        console.error("Error saving user token:", error);
      }
    };

    saveUserInfo();
  }, [userContext]);

  const resetUserContext = useCallback(async (caller = "Unknown") => {
    if (
      ![
        "WelcomeScreen",
        "LoginScreen",
        "CreateAccountScreen",
        "Logout",
        "ResetPasswordScreen",
      ].includes(caller)
    ) {
      return;
    }

    try {
      if (Platform.OS !== "web") await SecureStore.deleteItemAsync("token");
      setUserContext({ ...defaultUserState });
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{ userContext, setUserContext, resetUserContext }}>
      {children}
    </UserContext.Provider>
  );
};
