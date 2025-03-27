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
import { UserContext } from "../context/UserContext";

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
      navigation.navigate("EndingCreditsScreen");
    } catch (error) {
      console.error("Failed to clear AsyncStorage:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>Thank you!</Text>
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
    textAlign: "center",
    fontSize: 18,
    paddingBottom: 15,
  },
  bodyIntroText: {
    textAlign: "center",
    fontSize: 14,
    paddingBottom: 15,
    width: 225,
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
