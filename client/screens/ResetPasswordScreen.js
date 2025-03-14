import { useContext, useEffect, useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import emailjs from "@emailjs/browser";
import { MaterialIcons } from "@expo/vector-icons";
import {
  createNavigationContainerRef,
  useNavigation,
} from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export default function ResetPasswordScreen() {
  const navigation = useNavigation();

  const routes = navigation.getState().routes;
  const currentRoute = routes[routes.length - 1]?.name;
  console.log("Current Route:", currentRoute);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordReset = async () => {
    try {
      if (!email) {
        setDialogMessage("Please enter your email.");
        setShowDialog(true);
        return;
      }

      const response = await fetch(
        "http://localhost:8000/auth/request-password-reset",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      console.log("Response: ", response);
      console.log("Data: ", data);

      if (!response.ok) {
        console.log("Something went wrong.");
        setDialogMessage(data.message || "Error requesting password reset.");
        setShowDialog(true);
        return;
      }

      const { token } = data;
      if (!token) {
        setDialogMessage("Error generating reset token.");
        setShowDialog(true);
        return;
      }

      const resetLink = __DEV__
        ? `http://localhost:8081/password-reset/${token}`
        : `myapp://password-reset/${token}`;

      const subject = encodeURIComponent("Password Reset Request");
      const body = encodeURIComponent(
        `Hello,\n\nClick the link below to reset your password:\n${resetLink}\n\nIf you didn't request this, you can ignore this email.`
      );

      const emailURL = `mailto:${email}?subject=${subject}&body=${body}`;

      Linking.openURL(emailURL).catch((err) =>
        console.error("Error opening email:", err)
      );

      console.log("Success", "A password reset email has been sent!");
      setDialogMessage("Success. A password reset email has been sent!");
      setShowDialog(true);
      return;
    } catch (error) {
      console.error("Password reset error:", error);
      console.log("Unable to send reset email.");
    }
  };

  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      console.log("Deep Link URL:", url);

      if (!url) return;

      if (url) {
        const tokenMatch = url.match(/token=([^&]+)/);
        if (tokenMatch) {
          const token = tokenMatch[1];
          navigationRef.current?.navigate("ResetPasswordScreen", { token });
        }
      }

      let token;
      if (url.includes("password-reset/")) {
        token = url.split("password-reset/")[1];
      }

      if (token) {
        navigation.navigate("ResetPasswordScreen", { token });
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>Reset Password</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              placeholderTextColor="gray"
            />
          </View>
        </View>

        <View style={styles.resetContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handlePasswordReset}>
            <Text style={styles.resetButtonText}>Send Me Validation Email</Text>
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
  bodyTitleText: {
    fontSize: 26,
    textAlign: "center",
    paddingBottom: 30,
    fontWeight: "bold",
  },
  inputContainer: {
    width: "100%",
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderColor: "#A9A9A9",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    marginBottom: 10,
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
  eyeIcon: {
    padding: 10,
    marginLeft: 20,
    justifyContent: "flex-end",
    alignItems: "center",
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    gap: 15,
    marginTop: 50,
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
