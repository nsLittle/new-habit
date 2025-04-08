import { useContext, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Button, Dialog, Portal } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

export default function ResetPasswordScreen() {
  const { resetUserContext } = useContext(UserContext);

  useEffect(() => {
    resetUserContext("ResetPasswordScreen");
  }, []);

  const route = useRoute();
  const token =
    Platform.OS === "web"
      ? window.location.pathname.split("/").pop()
      : route.params?.token;

  const navigation = useNavigation();

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordReset = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDialogMessage(data.message || "Error resetting password.");
        setShowDialog(true);
        return;
      }

      setDialogMessage("Password reset successful. You can now log in.");
      setShowDialog(true);
      navigation.navigate("LoginScreen");
    } catch (error) {
      console.error("Password reset error:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={sharedStyles.container}>
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={{ backgroundColor: "white" }}>
          <Dialog.Title style={{ color: "red", fontWeight: "bold" }}>
            Alert
          </Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              labelStyle={{ color: "green", fontWeight: "bold", fontSize: 18 }}
              onPress={() => setShowDialog(false)}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={sharedStyles.body}>
        <View style={sharedStyles.bodyIntroContainer}>
          <Text style={sharedStyles.title}>Reset Password</Text>
        </View>

        <View style={sharedStyles.inputContainer}>
          <View style={sharedStyles.passwordContainer}>
            <TextInput
              style={sharedStyles.passwordInput}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              placeholderTextColor="gray"
            />
          </View>

          <View style={sharedStyles.passwordContainer}>
            <TextInput
              style={sharedStyles.passwordInput}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => setPassword(text)}
              placeholderTextColor="gray"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoIcon}>
              <MaterialIcons name="info-outline" size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={sharedStyles.buttonRow}>
          <TouchableOpacity
            style={sharedStyles.yellowButton}
            onPress={handlePasswordReset}>
            <Text style={sharedStyles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    paddingHorizontal: wp("5%"),
  },
  body: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingTop: Platform.OS === "web" ? hp("20%") : hp("2%"),
  },
  inputContainer: {
    width: "100%",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderColor: "#A9A9A9",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
  },
  infoIcon: {
    padding: 10,
  },
  passwordInput: {
    flex: 1,
    height: 40,
    padding: 10,
    backgroundColor: "transparent",
  },
  resetContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  resetLink: {
    fontSize: 12,
    paddingTop: 15,
    color: "#6A8CAF",
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 150,
    height: 45,
    justifyContent: "center",
  },
  resetButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
  },
});
