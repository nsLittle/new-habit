import { useContext, useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { resetUserContext } = useContext(UserContext) || {};

  useEffect(() => {
    if (resetUserContext) {
      resetUserContext("WelcomeScreen");
    }
  }, []);

  const openWebLink = async () => {
    try {
      await Linking.openURL("https://www.westwoodintl.com/");
    } catch (error) {
      console.error("Failed to open URL:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={sharedStyles.container}>
      <View style={sharedStyles.body}>
        <View style={sharedStyles.titleContainer}>
          <Text style={sharedStyles.title}>Welcome</Text>
          <Text style={sharedStyles.bodyText}>
            The <Text style={{ fontWeight: "bold" }}>proven</Text> habit
            formation method.
          </Text>
          <Text style={sharedStyles.bodyText}>
            Build better habits with feedback from those who know you best.
          </Text>
        </View>

        <TouchableOpacity onPress={openWebLink}>
          <Text style={sharedStyles.linkText}>Discover</Text>
        </TouchableOpacity>

        <View style={sharedStyles.buttonRow}>
          <TouchableOpacity
            style={sharedStyles.yellowButton}
            onPress={() => navigation.navigate("LoginScreen")}>
            <Text style={sharedStyles.buttonText}>Login ▶</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={sharedStyles.greyButton}
            onPress={() => navigation.navigate("CreateAccountScreen")}>
            <Text style={sharedStyles.buttonText}>Create Account ▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
