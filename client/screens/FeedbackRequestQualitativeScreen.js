import { useContext, useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function FeedbackRequestQualitativeScreen() {
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

  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("User Id Context: ", userIdContext);
      console.log("UserName Context: ", userNameContext);
      console.log("First Name Context: ", firstNameContext);
      console.log("Last Name Context: ", lastNameContext);
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

  const route = useRoute();
  const {
    teamMemberRouteId,
    teamMemberRouteFirstName,
    teamMemberRouteLastName,
    teamMemberRouteEmail,
    teamMemberRouteProfilePic,
  } = route.params || {};

  console.log("Received from FeedbackWelcomeScreen:", route.params);
  console.log("Team Member Id: ", teamMemberRouteId);
  console.log("Team Member First Name: ", teamMemberRouteFirstName);
  console.log("Team Member Last Name: ", teamMemberRouteLastName);
  console.log("Team Memeber Email: ", teamMemberRouteEmail);
  console.log("Team Member Profile Pic: ", teamMemberRouteProfilePic);

  const [feedbackText, setFeedbackText] = useState("");

  const handleSave = async () => {
    if (!feedbackText) {
      setDialogMessage(`Please give ${firstName} some feedback.`);
      setShowDialog(true);
      return;
    }

    const requestBody = {
      teamMemberId: teamMemberRouteId,
      feedbackText: feedbackText,
    };

    console.log(
      "PATCH Request:",
      `https://new-habit-69tm.onrender.com/feedback/${userNameContext}/${habitContextId}/text`
    );
    console.log("Request Body:", JSON.stringify(requestBody));

    try {
      const response = await fetch(
        `https://new-habit-69tm.onrender.com/feedback/${userNameContext}/${habitContextId}/text`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data: ", data);

      setDialogMessage("Feedback text updated successfully.");
      setShowDialog(true);
      console.log("Navigating with params:", {
        teamMemberRouteId,
        teamMemberRouteFirstName,
        teamMemberRouteLastName,
        teamMemberRouteEmail,
        teamMemberRouteProfilePic,
      });
      navigation.navigate("FeedbackDataScreen", {
        teamMemberRouteId,
        teamMemberRouteFirstName,
        teamMemberRouteLastName,
        teamMemberRouteEmail,
        teamMemberRouteProfilePic,
      });
    } catch (error) {
      setDialogMessage("Failed to update rating. Please try again.");
      setShowDialog(true);
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
          <Text style={styles.bodyTitleText}>
            What can {firstNameContext} do to become even more effective at{" "}
            {habitContextInput}?
          </Text>
        </View>

        <View style={styles.bodyIntroContainer}>
          <Text style={styles.bodyIntroText}>
            One concrete feedback to help {firstNameContext}
          </Text>
          <TextInput
            style={styles.input}
            value={feedbackText}
            onChangeText={setFeedbackText}
            placeholder={`${firstNameContext} can become more effective at ${habitContextInput} by`}></TextInput>

          <View style={styles.buttonRow}>
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
  input: {
    height: 80,
    borderColor: "#A9A9A9",
    borderWidth: 1,
    padding: 10,
    paddingTop: 0,
    lineHeight: 50,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    width: "100%",
    textAlignVertical: "top",
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
    width: 300,
    height: 45,
    justifyContent: "center",
  },
  saveButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
});
