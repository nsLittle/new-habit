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
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

export default function ResetPasswordRequestScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const { userIdContext, token } = userContext || {};

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [email, setEmail] = useState("");

  // const handleResetEmail = async () => {
  //   if (!email) {
  //     setDialogMessage("Please enter a valid email address.");
  //     setShowDialog(true);
  //     return;
  //   }

  //   try {
  //     const checkResponse = await fetch(
  //       `${BASE_URL}/user/check-email/${email}`
  //     );
  //     const checkData = await checkResponse.json();

  //     if (!checkData.exists) {
  //       setDialogMessage("Email not found. Please enter a registered email.");
  //       setShowDialog(true);
  //       return;
  //     }

  //     const response = await fetch(`${BASE_URL}/auth/password-reset-request`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ email }),
  //     });

  //     const data = await response.json();
  //     if (!data) {
  //       setDialogMessage(data.message || "Error requesting password reset.");
  //       setShowDialog(true);
  //       return;
  //     }

  //     const token = data.resetToken;

  //     if (!token) {
  //       setDialogMessage("Error generating reset token.");
  //       setShowDialog(true);
  //       return;
  //     }

  //     const subject = encodeURIComponent("Password Reset");
  //     const deepLink = __DEV__
  //       ? `http://localhost:8081/password-reset/${token}`
  //       : `myapp://password-reset/${token}`;

  //     const body = encodeURIComponent(
  //       `Hello, you requested a password reset link:\n${deepLink}`
  //     );

  //     const emailAddress = email;

  //     const emailURL = `mailto:${email}?subject=${subject}&body=${body}`;

  //     Linking.openURL(emailURL).catch((err) =>
  //       console.error("Error opening email:", err)
  //     );

  //     setDialogMessage("Password reset email successfully sent!");
  //     setShowDialog(true);
  //   } catch (error) {
  //     console.error("Password reset request error:", error);
  //     setDialogMessage("Something went wrong.");
  //     setShowDialog(true);
  //   }
  // };

  const handleResetEmail = async () => {
    if (!email) {
      setDialogMessage("Please enter a valid email address.");
      setShowDialog(true);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/password-reset-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDialogMessage(data.message || "Error sending password reset email.");
        setShowDialog(true);
        return;
      }

      setDialogMessage("Password reset email successfully sent!");
      setShowDialog(true);
    } catch (error) {
      console.error("Password reset request error:", error);
      setDialogMessage("Something went wrong.");
      setShowDialog(true);
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
        <View style={sharedStyles.titleContainer}>
          <Text style={sharedStyles.title}>Reset Password Request</Text>
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
        </View>

        <View style={sharedStyles.buttonRow}>
          <TouchableOpacity
            style={sharedStyles.yellowButton}
            onPress={handleResetEmail}>
            <Text style={sharedStyles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  infoIcon: {
    padding: 10,
  },
});
