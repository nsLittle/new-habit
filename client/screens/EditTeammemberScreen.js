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
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

export default function EditTeammemberScreen() {
  const navigation = useNavigation();

  const route = useRoute();
  const { firstName, lastName, email, profilePic, teamMember_id } =
    route.params || {};

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

  useEffect(() => {
    setEditedFirstName(firstName);
    setEditedLastName(lastName);
    setEditedEmail(email);
    setEditedProfilePic(profilePic);
  }, []);

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    // userIdContext,
    userNameContext,
    // firstNameContext,
    // lastNameContext,
    // emailContext,
    // profilePicContext,
    // habitContextId,
    // habitContextInput,
    // descriptionContextInput,
    // teamMemberContextId,
    token,
  } = userContext || {};

  const handleSave = async () => {
    try {
      const updates = {
        firstName: editedFirstName,
        lastName: editedLastName,
        email: editedEmail,
        profilePic: editedProfilePic,
      };

      if (!token) throw new Error("Authentication token is missing.");

      const routeCheck = `${BASE_URL}/teammember/${userNameContext}/${teamMember_id}`;
      const response = await fetch(
        `${BASE_URL}/teammember/${userNameContext}/${teamMember_id}`,
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
      setEditedFirstName(data.firstName);

      if (!response.ok) throw new Error("Failed to update user data");
      setUserData(data.teamMember);
      setDialogMessage("Success! Account updated successfully!");
      setDialogVisible(true);

      setTimeout(() => {
        setDialogVisible(false);
        navigation.navigate("ProfileScreen", { userNameContext });
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

      <View style={sharedStyles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={sharedStyles.title}>Edit Team Member</Text>
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

        <View style={sharedStyles.buttonRow}>
          <TouchableOpacity
            style={sharedStyles.yellowButton}
            onPress={() => {
              console.log("Save button pressed");
              handleSave();
            }}>
            <Text style={sharedStyles.buttonText}>Save ▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  // container: {
  //   flexGrow: 1,
  //   backgroundColor: "white",
  //   paddingHorizontal: wp("5%"),
  // },
  // body: {
  //   flexGrow: 1,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   backgroundColor: "white",
  //   paddingTop: Platform.OS === "web" ? hp("20%") : hp("2%"),
  // },
  // bodyTitleText: {
  //   fontSize: 26,
  //   textAlign: "center",
  //   paddingBottom: 30,
  //   fontWeight: "bold",
  // },
  profilePicMain: {
    borderWidth: 5,
    borderColor: "#FFD700",
    width: 100,
    height: 100,
    marginBottom: 15,
    borderRadius: 50,
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
  // buttonRow: {
  //   flexDirection: "row",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   width: "100%",
  //   paddingHorizontal: 20,
  //   gap: 15,
  //   marginTop: 50,
  // },
  // saveButton: {
  //   backgroundColor: "#FFD700",
  //   borderRadius: 25,
  //   paddingVertical: 15,
  //   paddingHorizontal: 20,
  //   alignItems: "center",
  //   width: 150,
  //   height: 45,
  //   justifyContent: "center",
  // },
  // saveButtonText: {
  //   color: "black",
  //   fontSize: 12,
  //   textAlign: "center",
  //   fontWeight: "bold",
  // },
});
