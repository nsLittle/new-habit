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
import { UserContext } from "../context/UserContext";

export default function EditAccountScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const { userName, userId, habitId, teammemberId, firstname, token } =
    userContext || {};
  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("UserName: ", userName);
      console.log("User Id: ", userId);
      console.log("Habit Id: ", habitId);
      console.log("Teammember Id: ", teammemberId);
      console.log("First Name: ", firstName);
      console.log("Last Name: ", lastName);
      console.log("Email: ", email);
      console.log("Profile Pic: ", profilePic);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const [habits, setHabits] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    profilePic: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dialogMessage, setDialogMessage] = useState(false);
  const [showDialog, setShowDialog] = useState("");

  const [showUsernameDialog, setShowUsernameDialog] = useState("");

  const [filledFields, setFilledFields] = useState({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profilePic, setProfilePic] = useState(userData.profilePic || "");
  const [email, setEmail] = useState("");

  useEffect(() => {
    console.log(`I'm here to retrieve your profile....`);
    const retrieveProfile = async () => {
      if (!token) {
        console.error("No token available, authentication required.");
        setLoading(false);
        return;
      }

      console.log("Sending Request with Token:", token);

      try {
        const response = await fetch(
          `http://192.168.1.174:8000/user/${userName}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          setDialogMessage(errorData.error || "We can't find you.");
          setShowDialog(true);
          console.log(`We can't find you.`);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Retrieved Data:", data);
        setUserData(data);

        console.log("ProfilePic URL:", data.profilePic);
      } catch (error) {
        setDialogMessage("An error occurred while retrieving your data.");
        setShowDialog(true);
        console.error("Data Retrieval Error:", error);
      }
      setLoading(false);
    };
    retrieveProfile();
  }, []);

  const handleSave = async () => {
    console.log(`I'm here to save your edits...`);
    try {
      const updates = {
        firstName,
        lastName,
        email,
        profilePic,
        password,
      };
      console.log("Updated User Data: ", updates);

      // const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Authentication token is missing.");

      const response = await fetch(
        `http://192.168.1.174:8000/user/${userName}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      const data = await response.json();
      console.log("Edit Response:", data);
      setUserData(data.user);

      if (!response.ok) throw new Error("Failed to update user data");

      setDialogMessage("Success", "Account updated successfully!");
      navigation.navigate("ProfileScreen", { userName });
    } catch (err) {
      console.log("Error", err.message);
    }
  };

  useEffect(() => {
    setFirstName(userData?.firstName || "");
    setLastName(userData?.lastName || "");
    setEmail(userData?.email || "");
    setProfilePic(userData?.profilePic || "");
    setPassword(userData?.password || "");
  }, [userData]);

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

          <View style={styles.usernameContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                filledFields.password && styles.filledInput,
              ]}
              placeholder="Username"
              value={userData.username}
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
              value={userData.password}
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
            onPress={() => navigation.navigate("ProfileScreen")}>
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

  bodyIntroText: {
    textAlign: "center",
    fontSize: 14,
    paddingBottom: 15,
    width: 225,
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
