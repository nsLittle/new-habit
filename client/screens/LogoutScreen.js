import React, { useContext } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";

export default function LogoutScreen() {
  const navigation = useNavigation();
  const { userContext, setUserContext } = useContext(UserContext);
  console.log("UserContext in LogoutScreen:", userContext);

  const logout = async () => {
    try {
      console.log("Logging out...");

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

      console.log("UserContext after reset:", userContext);
      console.log("Logout completed.");

      setTimeout(() => {
        navigation.navigate("EndingCreditsScreen");
      }, 500);
      navigation.navigate("EndingCreditsScreen");
    } catch (error) {
      console.error("Failed to clear AsyncStorage:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>Thank you</Text>
        </View>

        <View style={styles.bodyIntroContainer}>
          <Text style={styles.bodyIntroText}>
            We hope you enjoyed strengthening your habit.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: hp("15%"),
    backgroundColor: "white",
  },
  bodyTitleText: {
    fontSize: 26,
    textAlign: "center",
    paddingBottom: 30,
    fontWeight: "bold",
  },
  bodyIntroContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  bodyIntroText: {
    textAlign: "center",
    fontSize: 14,
    paddingBottom: 15,
    width: 225,
  },
  bodyIntroInviteText: {
    fontSize: 12,
    paddingTop: 15,
    color: "#6A8CAF",
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  buttonRow: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 50,
  },
  logoutButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    height: 45,
    width: 150,
  },
  logoutButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
  },
});
