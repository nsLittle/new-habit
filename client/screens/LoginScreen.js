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
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";

export default function LoginScreen() {
  const navigation = useNavigation();

  const routes = navigation.getState().routes;
  const currentRoute = routes[routes.length - 1]?.name;
  console.log("Current Route:", currentRoute);

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    userIdContext,
    userNameContext,
    firstNameContext,
    emailContext,
    profilePicContext,
    habitContextId,
    habitContextInput,
    descriptionContextInput,
    teamMemberContextId,
    token,
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
      habitInputContext: [],
      descriptionInputContext: "",
      teamMemberIdContext: "",
      token: null,
    });
  };

  // useEffect(() => {
  //   if (userContext) {
  //     console.log("UserContext:", userContext);
  //     console.log("User Id Context: ", userIdContext);
  //     console.log("UserName Context: ", userNameContext);
  //     console.log("Token: ", token);
  //   }
  // }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");

  const login = async () => {
    try {
      // console.log("Starting login...");
      // console.log("Username: ", username);
      // console.log("Password: ", password);

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

      // console.log("Raw response:", response);
      const data = await response.json();
      // console.log("Response text:", data);

      if (!response.ok) {
        setDialogMessage("Invalid username or password.");
        setShowDialog(true);
        // console.log("Invalid username or password.");
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
        // console.log("UserContext Updated! Navigating to ProfileScreen...");
        navigation.navigate("ProfileScreen");
      }, 200);
    } catch (error) {
      setDialogMessage("Something went wrong");
      setShowDialog(true);
      // console.log("Error saving user", error);
    }
  };

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
          <Text style={styles.bodyTitleText}>Login</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.usernameContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Username"
              value={username}
              onChangeText={(text) => setUsername(text)}
              placeholderTextColor="gray"
            />
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
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

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("WelcomeScreen")}>
            <Text style={styles.backButtonText} title="Back">
              ◀ Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={login}>
            <Text style={styles.loginButtonText}>Login ▶</Text>
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
  backButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 150,
    height: 45,
    justifyContent: "center",
  },
  backButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 150,
    height: 45,
    justifyContent: "center",
  },
  loginButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
  },
});
