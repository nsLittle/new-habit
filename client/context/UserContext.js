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
    console.log("🚀 User context initialized in memory only (not persisted)");
  }, []);

  useEffect(() => {
    const saveUserInfo = async () => {
      if (!userContext || !userContext.userIdContext) return;

      try {
        console.log("User Context Updated: ", userContext);

        // ✅ Save token securely on mobile (optional)
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
      console.log(
        `🛑 BLOCKED: resetUserContext should not be triggered by ${caller}`
      );
      return;
    }

    console.log(`✅ resetUserContext allowed: called by ${caller}`);

    try {
      if (Platform.OS !== "web") await SecureStore.deleteItemAsync("token");
      setUserContext({ ...defaultUserState });
    } catch (error) {
      console.error("❌ Error resetting user context:", error);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{ userContext, setUserContext, resetUserContext }}>
      {children}
    </UserContext.Provider>
  );
};
