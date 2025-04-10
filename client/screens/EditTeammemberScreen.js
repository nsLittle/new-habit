import { useState, useContext } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

export default function EditTeammemberScreen() {
  const navigation = useNavigation();

  const route = useRoute();
  const {
    teamMemberFirstName,
    teamMemberLastName,
    teamMemberEmail,
    teamMemberProfilePic,
    _id,
  } = route.params || {};

  const [editedFirstName, setEditedFirstName] = useState(
    teamMemberFirstName || ""
  );
  const [editedLastName, setEditedLastName] = useState(
    teamMemberLastName || ""
  );
  const [editedEmail, setEditedEmail] = useState(teamMemberEmail || "");
  const [editedProfilePic, setEditedProfilePic] = useState(
    teamMemberProfilePic || ""
  );

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
  const { userIdContext, userNameContext, token } = userContext || {};

  const handleSave = async () => {
    try {
      const updates = {
        firstName: editedFirstName,
        lastName: editedLastName,
        email: editedEmail,
        profilePic: editedProfilePic,
      };

      if (!token) throw new Error("Authentication token is missing.");

      const routeCheck = `${BASE_URL}/teammember/${userNameContext}/${_id}`;
      const response = await fetch(
        `${BASE_URL}/teammember/${userNameContext}/${_id}`,
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
        navigation.navigate("ReviewScreen", { userNameContext });
      }, 1000);
    } catch (err) {
      console.log("Error", err.message);
    }
  };

  const handleBlur = (field, value) => {
    setFilledFields((prev) => ({ ...prev, [field]: value.trim() !== "" }));
  };

  return (
    <ScrollView contentContainerStyle={sharedStyles.container}>
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={sharedStyles.dialog}>
          <Dialog.Title style={sharedStyles.dialogTitleInfo}>
            Alert
          </Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setDialogVisible(false)}
              labelStyle={sharedStyles.dialogButtonConfirm}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={sharedStyles.body}>
        <View style={sharedStyles.bodyTitleContainer}>
          <Text style={sharedStyles.title}>Edit Team Member</Text>
        </View>

        {editedProfilePic ? (
          <Image
            source={{ uri: editedProfilePic }}
            style={sharedStyles.profilePicMain}
          />
        ) : null}

        <View style={sharedStyles.inputContainer}>
          <TextInput
            style={sharedStyles.input}
            placeholder="First name"
            maxLength={150}
            value={editedFirstName}
            onChangeText={setEditedFirstName}></TextInput>
          <TextInput
            style={sharedStyles.input}
            placeholder="Last name"
            maxLength={150}
            value={editedLastName}
            onChangeText={setEditedLastName}></TextInput>
          <TextInput
            style={sharedStyles.input}
            placeholder="Email"
            maxLength={150}
            c
            value={editedEmail}
            onChangeText={setEditedEmail}></TextInput>
          <TextInput
            style={sharedStyles.input}
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
