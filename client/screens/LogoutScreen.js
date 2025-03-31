import React, { useContext } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

export default function LogoutScreen() {
  const navigation = useNavigation();
  const { userContext, setUserContext } = useContext(UserContext);

  const logout = async () => {
    try {
      await AsyncStorage.clear();

      if (Platform.OS !== "web") {
        await SecureStore.deleteItemAsync("token");
      }

      setUserContext({
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
      });

      setTimeout(() => {
        navigation.navigate("EndingCreditsScreen");
      }, 500);
    } catch (error) {
      console.error("Failed to clear AsyncStorage:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={sharedStyles.container}>
      <View style={sharedStyles.body}>
        <View style={sharedStyles.titleContainer}>
          <Text style={sharedStyles.title}>Thank you!</Text>
        </View>

        <View style={sharedStyles.bodyIntroContainer}>
          <Text style={sharedStyles.bodyText}>
            We hope you enjoyed strengthening your habit.
          </Text>

          <View style={sharedStyles.buttonRow}>
            <TouchableOpacity
              style={sharedStyles.yellowButton}
              onPress={logout}>
              <Text style={sharedStyles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
