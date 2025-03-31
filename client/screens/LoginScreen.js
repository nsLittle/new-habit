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
import { Button, Dialog, Portal } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

export default function LoginScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    userIdContext,
    // userNameContext,
    // firstNameContext,
    // emailContext,
    // profilePicContext,
    // habitContextId,
    // habitContextInput,
    // descriptionContextInput,
    // teamMemberContextId,
    // token,
  } = userContext || {};

  useEffect(() => {
    if (userContext && Object.keys(userContext).length !== 0) {
      resetUserContext();
    }
  }, []);

  const resetUserContext = () => {
    setUserContext({
      userIdContext: null,
      userNameContext: null,
      firstNameContext: null,
      lastNameContext: null,
      emailContext: null,
      profilePicContext: null,
      habitIdContext: [],
      habitContextInput: [],
      descriptionContextInput: "",
      teamMemberIdContext: "",
      token: null,
    });
  };

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const login = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDialogMessage("Invalid username or password.");
        setShowDialog(true);
        return;
      }

      setUserContext((prev) => ({
        ...prev,
        userIdContext: data.userId,
        userNameContext: data.username,
        firstNameContext: data.firstName,
        lastNameContext: data.lastName,
        emailContext: data.email,
        profilePicContext: data.profilePic,
        habitContextId: data.habitId,
        habitContextInput: data.habitinput,
        descriptionContextInput: data.descriptioninput,
        teamMemberContextId: data.teamMemberId,
        token: data.token,
      }));

      setTimeout(() => {
        navigation.navigate("ProfileScreen");
      }, 200);
    } catch (error) {
      setDialogMessage("Something went wrong");
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
          <Dialog.Title style={sharedStyles.dialogTitleAlert}>
            Alert
          </Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button labelStyle={sharedStyles.dialogButtonConfirm}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={sharedStyles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={sharedStyles.title}>Login</Text>
        </View>

        <View style={sharedStyles.inputContainer}>
          <View style={sharedStyles.passwordContainer}>
            <TextInput
              style={sharedStyles.passwordInput}
              placeholder="Username"
              value={username}
              onChangeText={(text) => setUsername(text)}
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

        <View style={styles.resetContainer}>
          <TouchableOpacity
            style={styles.reset}
            onPress={() => navigation.navigate("ResetPasswordRequestScreen")}>
            <Text style={styles.resetLink}>Reset Password</Text>
          </TouchableOpacity>
        </View>

        <View style={sharedStyles.buttonRow}>
          <TouchableOpacity
            style={sharedStyles.greyButton}
            onPress={() => navigation.navigate("WelcomeScreen")}>
            <Text style={sharedStyles.buttonText} title="Back">
              ◀ Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={sharedStyles.yellowButton} onPress={login}>
            <Text style={sharedStyles.buttonText}>Login ▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // inputContainer: {
  //   width: "85%",
  // },
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
  infoIcon: {
    padding: 10,
  },
  eyeIcon: {
    padding: 10,
    marginLeft: 20,
    justifyContent: "flex-end",
    alignItems: "center",
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
});
