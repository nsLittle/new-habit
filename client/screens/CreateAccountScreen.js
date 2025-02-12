import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { useState, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { TextInput } from "react-native-gesture-handler";
import { UserContext } from "../context/UserContext";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dialog, Portal, Button } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useEffect } from "react";

export default function CreateAccountScreen() {
  const [isValid, setIsValid] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [email, setEmail] = useState("");
  const [filledFields, setFilledFields] = useState({});
  const [showDialog, setShowDialog] = useState(false);
  const [showPictureDialog, setShowPictureDialog] = useState(false);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [existingUsernames, setExistingUsernames] = useState(new Set());
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const { setUserContext } = useContext(UserContext);

  useEffect(() => {
    const fetchExistingUsernames = async () => {
      try {
        const response = await fetch(`http://192.168.1.174:8000/${username}`);
        if (!response.ok) console.log("Yay! No duplicate username.");
      } catch (error) {
        console.error("Error fetching usernames:", error);
      }
    };

    fetchExistingUsernames();
  }, []);

  useEffect(() => {
    if (firstName && lastName) {
      setIsValid(true);

      let baseUsername = `${firstName[0].toUpperCase()}${lastName
        .charAt(0)
        .toUpperCase()}${lastName.slice(1).toLowerCase()}`;
      let newUsername = baseUsername;
      let count = 1;

      while (existingUsernames.has(newUsername)) {
        count++;
        newUsername = `${baseUsername}${count}`;
      }

      setUsername(newUsername);
    } else {
      setIsValid(false);
    }
  }, [firstName, lastName]);

  const handleBlur = (field, value) => {
    setFilledFields((prev) => ({ ...prev, [field]: value.trim() !== "" }));
  };

  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
  };

  const handleSave = async () => {
    if (!firstName || !lastName || !email || !profilePic || !password) {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("Signup Response:", data);

      if (!response.ok) {
        setDialogMessage(data.error || "Signup failed.");
        setShowDialog(true);
        return;
      }

      await AsyncStorage.setItem("username", data.user.username);
      await AsyncStorage.setItem("userId", data.user._id);
      await AsyncStorage.setItem("token", data.token);
      console.log("Storing Username", data.user.username);
      console.log("Storing UserID: ", data.user._id);
      console.log("Storing Token:", data.token);

      setUserContext({
        username: data.username,
        userId: data.user._id,
        token: data.token,
      });

      setUsername(data.username);

      console.log("User created successfully!");
      navigation.navigate("CreateHabitScreen");
    } catch (error) {
      setDialogMessage("An error occurred while saving your data.");
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
          visible={showUsernameDialog}
          onDismiss={() => setShowUsernameDialog(false)}
          style={{ backgroundColor: "white" }}>
          <Dialog.Title style={{ color: "blue", fontWeight: "bold" }}>
            Username Generation
          </Dialog.Title>
          <Dialog.Content>
            <Text>Your username will be automatically generated!</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowUsernameDialog(false)}
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
              placeholderTextColor="gray"
              editable={false}
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
