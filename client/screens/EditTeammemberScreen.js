import { useState, useEffect, useContext } from "react";
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
import { Button, Dialog, Portal } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function EditTeammemberScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { teamMember_id, firstName, lastName, email, profilePic } =
    route.params;

  console.log("Team Member ID: ", teamMember_id);
  console.log("Team Member First Name: ", firstName);
  console.log("Team Member Last Name> ", lastName);
  console.log("Team Member Email: ", email);
  console.log("Team member Profile Pic: ", profilePic);

  const [editedFirstName, setEditedFirstName] = useState(firstName || "");
  const [editedLastName, setEditedLastName] = useState(lastName || "");
  const [editedEmail, setEditedEmail] = useState(email || "");
  const [editedProfilePic, setEditedProfilePic] = useState(profilePic || "");

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const showDialog = (message, callback = null) => {
    setDialogMessage(message);
    setDialogVisible(true);

    if (callback) {
      setTimeout(() => {
        callback();
      }, 1000);
    }
  };
  const [userData, setUserData] = useState("");

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const { username, userId, habitId, teammemberId, firstname, token } =
    userContext || {};
  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("User Name: ", username);
      console.log("User Id: ", userId);
      console.log("Habit Id: ", habitId);
      console.log("Teammember Id: ", teammemberId);
      console.log("First Name: ", firstname);
      console.log("Token: ", token);
    }
  }, [userContext]);

  useEffect(() => {
    console.log(`I'm here to reset passed team member data...`);
    setEditedFirstName(firstName);
    console.log("Edited first name: ", editedFirstName);
    console.log("Old First Name: ", firstName);
    setEditedLastName(lastName);
    setEditedEmail(email);
    setEditedProfilePic(profilePic);
  }, []);

  const handleSave = async () => {
    console.log(`I'm here to save your team member edits...`);
    try {
      const updates = {
        firstName: editedFirstName,
        lastName: editedLastName,
        email: editedEmail,
        profilePic: editedProfilePic,
      };
      console.log("Updated User Data: ", updates);

      if (!token) throw new Error("Authentication token is missing.");

      console.log("Team Member Id: ", teamMember_id);
      const routeCheck = `https://new-habit-69tm.onrender.com/teammember/${username}/${teamMember_id}`;
      console.log("Route Check: ", routeCheck);

      const response = await fetch(
        `https://new-habit-69tm.onrender.com/teammember/${username}/${teamMember_id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teamMemberFirstName: editedFirstName,
            teamMemberLastName: editedLastName,
            teamMemberEmail: editedEmail,
            teamMemberProfilePic: editedProfilePic,
          }),
        }
      );

      const data = await response.json();
      console.log("Edit Response:", data);
      setEditedFirstName(data.firstName);
      console.log("Edited First Name; ", editedFirstName);

      if (!response.ok) throw new Error("Failed to update user data");
      setUserData(data.teamMember);

      setDialogMessage("Success! Account updated successfully!");
      setDialogVisible(true);

      setTimeout(() => {
        setDialogVisible(false);
        navigation.navigate("ProfileScreen", { username });
      }, 1000);
    } catch (err) {
      console.log("Error", err.message);
    }
  };

  const handleBlur = (field, value) => {
    setFilledFields((prev) => ({ ...prev, [field]: value.trim() !== "" }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Alert</Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setDialogVisible(false)}
              labelStyle={styles.dialogButton}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>Edit Team Member</Text>
        </View>

        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePicMain} />
        ) : null}

        <View>
          <TextInput
            style={styles.inputField}
            placeholder="First name"
            maxLength={150}
            value={editedFirstName}
            onChangeText={setEditedFirstName}></TextInput>
          <TextInput
            style={styles.inputField}
            placeholder="Last name"
            maxLength={150}
            value={editedLastName}
            onChangeText={setEditedLastName}></TextInput>
          <TextInput
            style={styles.inputField}
            placeholder="Email"
            maxLength={150}
            value={editedEmail}
            onChangeText={setEditedEmail}></TextInput>
          <TextInput
            style={styles.inputField}
            placeholder="ProfilePic"
            value={editedProfilePic}
            onChangeText={setEditedProfilePic}></TextInput>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("TeamInviteScreen")}>
            <Text style={styles.backButtonText} title="Back">
              ◀ Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              console.log("Save button pressed");
              handleSave();
            }}>
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
  inputField: {
    height: 40,
    borderColor: "#A9A9A9",
    borderWidth: 1,
    width: 400,
    padding: 10,
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    marginVertical: 10,
    color: "gray",
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
  dialog: {
    backgroundColor: "white",
  },
  dialogTitle: {
    color: "red",
    fontWeight: "bold",
  },
  dialogButton: {
    color: "green",
    fontWeight: "bold",
    fontSize: 18,
  },
});
