import React, { useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../context/UserContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function LogoutScreen() {
  const navigation = useNavigation();
  const { userContext, setUserContext } = useContext(UserContext);
  console.log("UserContext in LogoutScreen:", userContext);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("username");
      await AsyncStorage.removeItem("userId");
      setUserContext(null);
      navigation.navigate("WelcomeScreen");
    } catch (error) {
      console.error("Failed to clear AsyncStorage:", error);
    }
  };

  // const openWebLink = async () => {
  //   try {
  //     await Linking.openURL("https://www.westwoodintl.com/");
  //   } catch (error) {
  //     console.error("Failed to open URL:", error);
  //   }
  // };

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
          {/* <TouchableOpacity onPress={openWebLink}>
            <Text style={styles.bodyIntroInviteText}>More</Text>
          </TouchableOpacity> */}

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
    // flexDirection: "row",
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
