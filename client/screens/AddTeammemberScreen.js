import { useContext, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
} from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function AddTeammemberScreen() {
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
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("User Id Context: ", userIdContext);
      console.log("UserName Context: ", userNameContext);
      console.log("First Name Context: ", firstNameContext);
      console.log("Email Context: ", emailContext);
      console.log("Profile Pic Context: ", profilePicContext);
      console.log("Habit Id Context: ", habitContextId);
      console.log("Habit Input Context: ", habitContextInput);
      console.log("Description Input Context: ", descriptionContextInput);
      console.log("TeamMember Id Context: ", teamMemberContextId);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [profilePic, setProfilePic] = useState("");
  const [teamMemberFirstName, setTeamMemberFirstName] = useState("");
  const [teamMemberLastName, setTeamMemberLastName] = useState("");
  const [teamMemberEmail, setTeamMemberEmail] = useState("");
  const [teamMemberProfilePic, setTeamMemberProfilePic] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);

  const handleSave = async () => {
    console.log("I'm here to save team members...");
    const { userIdContext } = userContext;

    if (!userIdContext) {
      setDialogMessage("Failed to fetch user information. Please try again.");
      setShowDialog(true);
      return;
    }

    const newTeamMember = {
      teamMemberFirstName,
      teamMemberLastName,
      teamMemberEmail,
      teamMemberProfilePic,
      user: userIdContext,
    };

    console.log("New Team Member: ", newTeamMember);

    try {
      if (!token) {
        setDialogMessage("No token found. Please log in again.");
        setShowDialog(true);
        return false;
      }

      if (
        !teamMemberFirstName ||
        !teamMemberLastName ||
        !teamMemberEmail ||
        !teamMemberProfilePic
      ) {
        setDialogMessage("All fields are required.");
        setShowDialog(true);
        return false;
      }

      const response = await fetch(
        `http://localhost:8000/teammember/${userNameContext}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newTeamMember),
        }
      );

      console.log("New Team Member: ", newTeamMember);

      const data = await response.json();
      console.log("Response Data:", data);

      if (data.message === "Person already on your team.") {
        setDialogMessage("Person already on your team.");
        setShowDialog(true);
        return;
      }

      if (response.ok) {
        const { teamMember } = data;
        console.log("Team Member: ", teamMember);

        setTeamMembers([teamMember, ...teamMembers]);
        setTeamMemberFirstName("");
        setTeamMemberLastName("");
        setTeamMemberEmail("");
        setTeamMemberProfilePic("");

        setDialogMessage("Team member added successfully!");
        setShowDialog(true);
        navigation.navigate("TeamInviteScreen");
      }
    } catch (error) {
      console.error("Error saving team member.", error);
      setDialogMessage("Error saving team member.");
      setShowDialog(true);
      navigation.navigate("TeamInviteScreen");
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Alert</Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowDialog(false)}
              labelStyle={styles.dialogButton}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>Add Team Member</Text>
        </View>

        {teamMemberProfilePic ? (
          <Image
            source={{ uri: teamMemberProfilePic }}
            style={styles.profilePicMain}
          />
        ) : null}

        <View>
          <Text style={styles.inputTitle}>First Name</Text>
          <TextInput
            style={styles.inputField}
            placeholder="First name"
            maxLength={150}
            value={teamMemberFirstName}
            onChangeText={setTeamMemberFirstName}></TextInput>
          <Text style={styles.inputTitle}>Last Name</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Last name"
            maxLength={150}
            value={teamMemberLastName}
            onChangeText={setTeamMemberLastName}></TextInput>
          <Text style={styles.inputTitle}>Email</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Email"
            maxLength={150}
            value={teamMemberEmail}
            onChangeText={setTeamMemberEmail}></TextInput>
          <Text style={styles.inputTitle}>ProfilePic</Text>
          <TextInput
            style={styles.inputField}
            placeholder="ProfilePic"
            value={teamMemberProfilePic}
            onChangeText={setTeamMemberProfilePic}></TextInput>
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
              console.log("Save button pressed!");
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
  bodyIntroContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  bodyIntroText: {
    textAlign: "center",
    fontSize: 14,
    paddingBottom: 15,
    width: 225,
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
