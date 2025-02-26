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
    userName,
    userId,
    habitId,
    habitinput,
    descriptioninput,
    teammemberId,
    firstName,
    lastName,
    email,
    profilePic,
    token,
  } = userContext || {};

  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("Username: ", userName);
      console.log("User Id: ", userId);
      console.log("Habit Id: ", habitId);
      console.log("Habit Input: ", habitinput);
      console.log("Description Input: ", descriptioninput);
      console.log("Teammember Id: ", teammemberId);
      console.log("First Name: ", firstName);
      console.log("Last Name: ", lastName);
      console.log("Email: ", email);
      console.log("Profile Pic: ", profilePic);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const route = useRoute();
  const {
    teamMemberId,
    teamMemberFirstName,
    teamMemberLastName,
    teamMemberEmail,
    teamMemberProfilePic,
  } = route.params || {};

  console.log("Received from FeedbackRequestThreeScreen:", route.params);
  console.log("Team Member Id: ", teamMemberId);
  console.log("Team Member First Name: ", teamMemberFirstName);
  console.log("Team Member Last Name: ", teamMemberLastName);
  console.log("Team Memeber Email: ", teamMemberEmail);
  console.log("Team Member Profile Pic: ", teamMemberProfilePic);

  const [feedbackText, setFeedbackText] = useState("");

  const handleSave = async () => {
    if (!feedbackText) {
      setDialogMessage("Please give {firstName} some feedback.");
      setShowDialog(true);
      return;
    }

    const requestBody = {
      teamMemberId: teamMemberId,
      feedbackText: feedbackText,
    };

    console.log(
      "PATCH Request:",
      `http://192.168.1.174:8000/feedback/${username}/${habitId}`
    );
    console.log("Request Body:", JSON.stringify(requestBody));

    try {
      const response = await fetch(
        `http://192.168.1.174:8000/feedback/${username}/${habitId}`,
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
      setDialogMessage("Feedback text updated successfully.");
      setShowDialog(true);
      navigation.navigate("UnknownScreen");
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
            What can {firstName} do to become even more effective at{" "}
            {habitinput}?
          </Text>
        </View>

        <View style={styles.bodyIntroContainer}>
          <Text style={styles.bodyIntroText}>
            One concrete feedback to help {firstName}
          </Text>
          <TextInput
            style={styles.input}
            value={feedbackText}
            onChangeText={setFeedbackText}
            placeholder={`${firstName} can become more effective at ${habitinput} by`}></TextInput>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                navigation.navigate("FeedbackRequestThanksRatingScreen")
              }>
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
              <Text
                style={styles.saveButtonText}
                onPress={() => {
                  console.log("Navigating with params:", {
                    teamMemberId,
                    teamMemberFirstName,
                    teamMemberLastName,
                    teamMemberEmail,
                    teamMemberProfilePic,
                  });

                  navigation.navigate("UnknownScreen", {
                    teamMemberId,
                    teamMemberFirstName,
                    teamMemberLastName,
                    teamMemberEmail,
                    teamMemberProfilePic,
                  });
                }}>
                Save
              </Text>
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
});
