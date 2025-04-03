import { useContext, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { Button, Dialog, Portal } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

export default function CreateAccountScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    // userIdContext,
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

  const resetUserContext = () => {
    setUserContext(null);
  };

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [showPictureDialog, setShowPictureDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [filledFields, setFilledFields] = useState({});

  const [showPassword, setShowPassword] = useState(false);

  const nonDuplicateUsername = async (username) => {
    if (!username.trim()) return false;

    try {
      const response = await fetch(`${BASE_URL}/user/check/${username}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.status === 404) {
        return true;
      }

      if (!response.ok) {
        throw new Error("Failed to check username.");
        return true;
        console.error("Unexpected response checking username.");
        return false;
      }

      if (data && data.user) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking for duplicate username", error);
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

    const isUnique = await nonDuplicateUsername(username);
    if (!isUnique) {
      setDialogMessage("Username already taken. Please choose another.");
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

    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed.");
      }

      setUserContext((prevContext) => ({
        ...prevContext,
        userNameContext: data.user.username,
        userIdContext: data.user._id,
        token: data.token,
        firstNameContext: data.user.firstName,
        lastNameContext: data.user.lastName,
        emailContext: data.user.email,
        profilePicContext: data.user.profilePic,
      }));

      setDialogMessage("Account created successfully!");
      setShowDialog(true);

      setTimeout(() => {
        navigation.navigate("CreateHabitScreen");
      }, 500);
      return;
    } catch (error) {
      setDialogMessage("Signup error. Please try again.");
      setShowDialog(true);
      console.error("Signup Error:", error);
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
            <Button
              onPress={() => setShowDialog(false)}
              labelStyle={sharedStyles.dialogButtonConfirm}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={showPictureDialog}
          onDismiss={() => setShowPictureDialog(false)}
          style={{ backgroundColor: "white" }}>
          <Dialog.Title style={sharedStyles.dialogTitleAlert}>
            Profile Image
          </Dialog.Title>
          <Dialog.Content>
            <Text>Enter an url that points to your profile image.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowPictureDialog(false)}
              labelStyle={sharedStyles.dialogButtonConfirm}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={showPasswordDialog}
          onDismiss={() => setShowPasswordDialog(false)}
          style={{ backgroundColor: "white" }}>
          <Dialog.Title style={sharedStyles.dialogTitleAlert}>
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
              labelStyle={sharedStyles.dialogButtonConfirm}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={showUsernameDialog}
          onDismiss={() => setShowUsernameDialog(false)}
          style={{ backgroundColor: "white" }}>
          <Dialog.Title style={sharedStyles.dialogTitleAlert}>
            Username
          </Dialog.Title>
          <Dialog.Content>
            <Text>Once created username can not be changed.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowUsernameDialog(false)}
              labelStyle={sharedStyles.dialogButtonConfirm}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={sharedStyles.body}>
        <Text style={sharedStyles.title}>Create Account</Text>
        {profilePic ? (
          <Image
            source={{ uri: profilePic }}
            style={sharedStyles.profilePicMain}
          />
        ) : null}

        <View style={sharedStyles.inputContainer}>
          <TextInput
            style={[
              sharedStyles.input,
              filledFields.firstName && sharedStyles.filledInput,
            ]}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor="gray"
            onBlur={() => handleBlur("firstName", firstName)}
          />
          <TextInput
            style={[
              sharedStyles.input,
              filledFields.lastName && sharedStyles.filledInput,
            ]}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor="gray"
            onBlur={() => handleBlur("lastName", lastName)}
          />
          <TextInput
            style={[
              sharedStyles.input,
              filledFields.email && sharedStyles.filledInput,
            ]}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="gray"
            onBlur={() => handleBlur("email", email)}
          />

          <View
            style={[
              sharedStyles.passwordContainer,
              filledFields.profilePic && sharedStyles.filledInput,
            ]}>
            <TextInput
              style={sharedStyles.passwordInput}
              v
              placeholder="Profile Picture"
              value={profilePic}
              onChangeText={setProfilePic}
              placeholderTextColor="gray"
              onBlur={() => handleBlur("profilePic", profilePic)}
            />
            <TouchableOpacity
              onPress={() => setShowPictureDialog(true)}
              style={sharedStyles.iconButton}>
              <MaterialIcons name="info-outline" size={20} color="gray" />
            </TouchableOpacity>
          </View>

          <View style={sharedStyles.passwordContainer}>
            <TextInput
              style={[
                sharedStyles.passwordInput,
                filledFields.password && sharedStyles.filledInput,
              ]}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="gray"
              onBlur={() => handleBlur("username", username)}
            />
            <TouchableOpacity
              onPress={() => setShowUsernameDialog(true)}
              style={sharedStyles.iconButton}>
              <MaterialIcons name="info-outline" size={20} color="gray" />
            </TouchableOpacity>
          </View>

          <View style={sharedStyles.passwordContainer}>
            <TextInput
              style={[
                sharedStyles.passwordInput,
                filledFields.password && sharedStyles.filledInput,
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
              style={sharedStyles.iconButton}>
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPasswordDialog(true)}
              style={sharedStyles.iconButton}>
              <MaterialIcons name="info-outline" size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={sharedStyles.buttonRow}>
          <TouchableOpacity
            style={sharedStyles.greyButton}
            onPress={() => navigation.navigate("WelcomeScreen")}>
            <Text style={sharedStyles.buttonText}>◀ Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={sharedStyles.yellowButton}
            onPress={handleSave}>
            <Text style={sharedStyles.buttonText}>Save ▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
