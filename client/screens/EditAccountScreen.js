import { useContext, useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Portal, Dialog, Button } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { retrieveProfile } from "../utils/fetchers";

export default function EditAccountScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    userIdContext,
    userNameContext,
    firstNameContext,
    lastNameContext,
    emailContext,
    profilePicContext,
    habitContextId,
    habitContextInput,
    descriptionContextInput,
    teamMemberContextId,
    token,
  } = userContext || {};

  const [dialogMessage, setDialogMessage] = useState(false);
  const [showDialog, setShowDialog] = useState("");

  const [showUsernameDialog, setShowUsernameDialog] = useState("");

  const [filledFields, setFilledFields] = useState({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [maskedPassword, setMaskedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userName, setUserName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    setFirstName(firstNameContext || "");
    setLastName(lastNameContext || "");
    setEmail(emailContext || "");
    setProfilePic(profilePicContext || "");
    setUserName(userNameContext || "");
    setPassword("password123");
    setMaskedPassword("*".repeat("password123".length));
  }, [userContext]);

  const handlePasswordChange = (text) => {
    setPassword(text);
    setMaskedPassword("*".repeat(text.length));
  };

  const handleSave = async () => {
    try {
      const updates = {
        userName: userName,
        firstName: firstName,
        lastName: lastName,
        email: email,
        profilePic: profilePic,
      };

      if (password && password !== "********") {
        updates.password = password;
      }

      if (!token) throw new Error("Authentication token is missing.");

      const response = await fetch(`${BASE_URL}/user/${userNameContext}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      setUserContext((prev) => ({ ...prev, ...updates }));

      if (!response.ok) throw new Error("Failed to update user data");

      setDialogMessage("Success", "Account updated successfully!");
      navigation.navigate("ReviewScreen", { userNameContext });
    } catch (err) {
      console.log("Error", err.message);
    }
  };

  useEffect(() => {
    setFirstName(firstNameContext || "");
    setLastName(lastNameContext || "");
    setEmail(emailContext || "");
    setProfilePic(profilePicContext || "");
    setPassword("********");
    setUserName(userNameContext || "");
  }, [userContext]);

  const handleBlur = (field, value) => {
    setFilledFields((prev) => ({ ...prev, [field]: value.trim() !== "" }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Portal>
        <Dialog
          visible={showUsernameDialog}
          onDismiss={() => setShowUsernameDialog(false)}
          style={{ backgroundColor: "white" }}>
          <Dialog.Title style={{ color: "blue", fontWeight: "bold" }}>
            Username
          </Dialog.Title>
          <Dialog.Content>
            <Text>Username can not be changed!</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowUsernameDialog(false)}
              labelStyle={{ color: "green", fontWeight: "bold", fontSize: 18 }}>
              Okay
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>Edit Account</Text>
        </View>

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

          <View style={styles.pictureContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Username"
              value={userName}
              editable={false}
              placeholderTextColor="gray"
            />
            <TouchableOpacity
              onPress={() => setShowUsernameDialog(true)}
              style={styles.iconButton}>
              <MaterialIcons name="info-outline" size={20} color="gray" />
            </TouchableOpacity>
          </View>

          <View style={styles.pictureContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={showPassword ? password : maskedPassword}
              secureTextEntry={!showPassword}
              onChangeText={handlePasswordChange}
              placeholderTextColor="gray"
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
          </View>
        </View>

        <View style={styles.buttonRow}>
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
    paddingTop: 60,
    paddingBottom: 30,
    fontWeight: "bold",
  },
  profilePicMain: {
    borderWidth: 5,
    borderColor: "#FFD700",
    width: 100,
    height: 100,
    marginBottom: 15,
    borderRadius: 50,
    shadowColor: "#87CEEB",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    height: 40,
    borderColor: "#A9A9A9",
    borderWidth: 1,
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    width: wp("85%"),
    alignSelf: "center",
  },
  filledInput: {
    backgroundColor: "#E6FFCC",
  },
  pictureContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: wp("85%"),
    alignSelf: "center",
    borderColor: "#A9A9A9",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    marginVertical: 8,
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
    width: 250,
    height: 45,
    justifyContent: "center",
  },
  saveButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
  },
});
