import { useContext, useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { Button, Dialog, Portal } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function CreateAccountScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    userName,
    userId,
    habitId,
    habitinput,
    teammemberId,
    firstname,
    Email,
    ProfilePic,
    token,
  } = userContext || {};

  useEffect(() => {
    resetUserContext();
  }, []);

  const resetUserContext = () => {
    setUserContext(null); // Or whatever clean slate looks like
  };

  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("Username: ", userName);
      console.log("User Id: ", userId);
      console.log("Habit Input: ", habitinput);
      console.log("Habit Id: ", habitId);
      console.log("Teammember Id: ", teammemberId);
      console.log("First Name: ", firstname);
      console.log("Email: ", Email);
      console.log("Profile Pic: ", ProfilePic);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [showPictureDialog, setShowPictureDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [filledFields, setFilledFields] = useState({});

  const [showPassword, setShowPassword] = useState(false);

  const nonDuplicateUsername = async () => {
    try {
      console.log("Checking for duplicate username.");
      console.log("Username: ", username);
      const response = await fetch(`http://192.168.1.174:8000/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check username.");
      }

      const data = await response.json();
      console.log("Data: ", data);

      const usernames = data.usernames;

      if (!Array.isArray(usernames)) {
        console.error("API response is not an array:", data);
        return false;
      }

      const isDuplicate = usernames.includes(username);

      return !isDuplicate;
    } catch (error) {
      console.error("Error looking for duplication", error);
      return false;
    }
  };

  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
  };

  const handleBlur = (field, value) => {
    setFilledFields((prev) => ({ ...prev, [field]: value.trim() !== "" }));
  };

  const handleSave = async () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !profilePic ||
      !username ||
      !password
    ) {
      setDialogMessage("Please fill out all required fields.");
      setShowDialog(true);
      return;
    }

    if (!isValidPassword(password)) {
      setDialogMessage(
        "Password must contain at least 6 characters, one uppercase letter, one lowercase letter, and one number."
      );
      setShowDialog(true);
      return;
    }

    const isUniqueUsername = await nonDuplicateUsername();
    if (!isUniqueUsername) {
      setDialogMessage(
        "This username is already taken. Please choose another one."
      );
      setShowDialog(true);
      return;
    }

    const userData = {
      firstName,
      lastName,
      email,
      profilePic,
      username,
      password,
    };

    console.log("Sending signup request:", JSON.stringify(userData));

    try {
      const response = await fetch("http://192.168.1.174:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed.");
      }

      console.log("Saved Data: ", data);

      setUserContext((prevContext) => {
        const updatedContext = {
          ...prevContext,
          username: data.user.username,
          userId: data.user._id,
          token: data.token,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          profilePic: data.user.profilePic,
        };

        console.log("Saved User Context: ", updatedContext);
        setDialogMessage("Account created successfully!");
        setShowDialog(true);
        return updatedContext;
      });

      setTimeout(() => {
        navigation.navigate("CreateHabitScreen");
      }, 500);
    } catch (error) {
      setDialogMessage("Signup error. Please try again.");
      setShowDialog(true);
      console.error("Signup Error:", error);
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

        <Dialog
          visible={showPictureDialog}
          onDismiss={() => setShowPictureDialog(false)}
          style={{ backgroundColor: "white" }}>
          <Dialog.Title style={{ color: "blue", fontWeight: "bold" }}>
            Picture Generation
          </Dialog.Title>
          <Dialog.Content>
            <Text>Enter an image url!</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowPictureDialog(false)}
              labelStyle={{ color: "green", fontWeight: "bold", fontSize: 18 }}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={showPasswordDialog}
          onDismiss={() => setShowPasswordDialog(false)}
          style={{ backgroundColor: "white" }}>
          <Dialog.Title style={{ color: "blue", fontWeight: "bold" }}>
            Password Requirements
          </Dialog.Title>
          <Dialog.Content>
            <Text>• At least one uppercase letter</Text>
            <Text>• At least one lowercase letter</Text>
            <Text>• At least one number</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowPasswordDialog(false)}
              labelStyle={{ color: "green", fontWeight: "bold", fontSize: 18 }}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.body}>
        <Text style={styles.bodyTitleText}>Create Account</Text>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePicMain} />
        ) : null}

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, filledFields.firstName && styles.filledInput]}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor="gray"
            onBlur={() => handleBlur("firstName", firstName)}
          />
          <TextInput
            style={[styles.input, filledFields.lastName && styles.filledInput]}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor="gray"
            onBlur={() => handleBlur("lastName", lastName)}
          />
          <TextInput
            style={[styles.input, filledFields.email && styles.filledInput]}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="gray"
            onBlur={() => handleBlur("email", email)}
          />

          <View style={styles.pictureContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                filledFields.profilePic && styles.filledInput,
              ]}
              placeholder="Profile Picture"
              value={profilePic}
              onChangeText={setProfilePic}
              placeholderTextColor="gray"
              onBlur={() => handleBlur("profilePic", profilePic)}
            />
            <TouchableOpacity
              onPress={() => setShowPictureDialog(true)}
              style={styles.iconButton}>
              <MaterialIcons name="info-outline" size={20} color="gray" />
            </TouchableOpacity>
          </View>

          <View style={styles.usernameContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                filledFields.password && styles.filledInput,
              ]}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="gray"
              onBlur={() => handleBlur("username", username)}
            />
            <TouchableOpacity
              onPress={() => setShowUsernameDialog(true)}
              style={styles.iconButton}>
              <MaterialIcons name="info-outline" size={20} color="gray" />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                filledFields.password && styles.filledInput,
              ]}
              placeholder="Password"
              value={password}
              placeholderTextColor="gray"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              onBlur={() => handleBlur("password", password)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.iconButton}>
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPasswordDialog(true)}
              style={styles.iconButton}>
              <MaterialIcons name="info-outline" size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("WelcomeScreen")}>
            <Text style={styles.backButtonText}>◀ Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save ▶</Text>
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
  input: {
    height: 40,
    borderColor: "#A9A9A9",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    width: "100%",
  },
  filledInput: {
    backgroundColor: "#E6FFCC",
  },
  pictureContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderColor: "#A9A9A9",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    marginBottom: 10,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderColor: "#A9A9A9",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#E6FFCC",
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
    placeholderTextColor: "gray",
  },
  iconButton: {
    padding: 10,
  },
  passwordInput: {
    flex: 1,
    height: 40,
    padding: 10,
    backgroundColor: "transparent",
  },
  iconButton: {
    padding: 10,
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
  saveButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 150,
    height: 45,
    justifyContent: "center",
  },
  saveButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
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
    fontWeight: "bold",
  },
  profilePicMain: {
    borderWidth: 5,
    borderColor: "#FFD700",
    width: 100,
    height: 100,
    marginBottom: 15,
    borderRadius: 50,
  },
});
