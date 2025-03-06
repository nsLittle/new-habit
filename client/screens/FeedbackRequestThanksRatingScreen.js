import { useContext, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { UserContext } from "../context/UserContext";

export default function FeedbackRequestThanksRatingScreen() {
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
  const { teamMember } = route.params || {};

  console.log("Received from FeedbackRequestScreen:", route.params);
  console.log("Team Member Id: ", route.params.teamMemberContextId);
  console.log(
    "Team Member First Name: ",
    route.params.teamMemberContextFirstName
  );
  console.log(
    "Team Member Last Name: ",
    route.params.teamMemberContextLastName
  );
  console.log("Team Memeber Email: ", route.params.teamMemberContextEmail);
  console.log(
    "Team Member Profile Pic: ",
    route.params.teamMemberContextProfilePic
  );

  const [ratingValue, setRatingValue] = useState("");
  const [existingRating, setExistingRating] = useState("");
  console.log("Rating Value: ", ratingValue);

  const ratings = [
    { value: 1, label: "No perceptible follow-up", color: "#DC143C" }, // Crimson
    { value: 2, label: "Little follow-up", color: "#FF4500" }, // Red-Orange
    { value: 3, label: "Some follow-up", color: "#FFD700" }, // Yellow
    { value: 4, label: "Frequent follow-up", color: "#90EE90" }, // Light Green
    { value: 5, label: "Constructive follow-up", color: "#008000" }, // Green
  ];

  useEffect(() => {
    console.log("I'm here to fetch GET feedback...");

    const fetchFeedback = async () => {
      try {
        const response = await fetch(
          `http://192.168.1.174:8000/feedback/${userNameContext}/${habitContextId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error("No existing feedback found.");
          return;
        }

        const data = await response.json();
        console.log("Retrieved Feedback:", data);
        if (data.feedback.length > 0) {
          setFeedbackId(data.feedback[0].feedbackId); // Store feedbackId in state
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    fetchFeedback();
  }, []);

  const handleSave = async () => {
    console.log("I'm here to handle save...");
    if (!ratingValue) {
      setDialogMessage("Please select a feedback rating.");
      setShowDialog(true);
      return;
    }

    const requestBody = {
      teamMemberId: route.params.teamMemberContextId,
      feedbackThanksRating: ratingValue,
    };

    console.log(
      "PATCH Request:",
      `http://192.168.1.174:8000/feedback/${userNameContext}/${habitContextId}`
    );
    console.log("Request Body:", JSON.stringify(requestBody));

    try {
      const response = await fetch(
        `http://192.168.1.174:8000/feedback/${userNameContext}/${habitContextId}`,
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

      setDialogMessage("Thank you rating updated successfully.");
      setShowDialog(true);
      console.log("Navigating with params:", {
        teamMemberContextId: route.params.teamMemberContextId,
        teamMemberContextFirstName: route.params.teamMemberContextFirstName,
        teamMemberContextLastName: route.params.teamMemberContextLastName,
        teamMemberContextEmail: route.params.teamMemberContextEmail,
        teamMemberContextProfilePic: route.params.teamMemberContextProfilePic,
      });
      navigation.navigate("FeedbackRequestQualitativeScreen", {
        teamMemberContextId: route.params.teamMemberContextId,
        teamMemberContextFirstName: route.params.teamMemberContextFirstName,
        teamMemberContextLastName: route.params.teamMemberContextLastName,
        teamMemberContextEmail: route.params.teamMemberContextEmail,
        teamMemberContextProfilePic: route.params.teamMemberContextProfilePic,
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
            Did {firstNameContext} thank you and ask for more suggestions from
            last feedback?
          </Text>
        </View>

        <View style={styles.bodyIntroContainer}>
          <View style={styles.ratingContainer}>
            {ratings.map((rating) => (
              <TouchableOpacity
                key={rating.value}
                style={[
                  styles.ratingButton,
                  ratingValue === rating.value && {
                    borderColor: rating.color,
                    backgroundColor: "#F0F0F0",
                  },
                ]}
                onPress={() => setRatingValue(rating.value)}>
                <View
                  style={[
                    styles.circle,
                    ratingValue === rating.value && {
                      backgroundColor: rating.color,
                      borderColor: rating.color,
                    },
                  ]}
                />
                <Text style={styles.label}>{rating.label}</Text>
                <View
                  style={[styles.numberBox, { backgroundColor: rating.color }]}>
                  <Text style={styles.number}>{rating.value}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                console.log("Save button pressed");
                handleSave();
              }}>
              <Text>Save</Text>
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
  ratingContainer: {
    flexDirection: "column",
    alignItems: "center",
    padding: 10,
    width: "100%",
  },
  ratingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
    width: "85%",
    padding: 10,
    marginVertical: 3,
    borderWidth: 2,
    borderColor: "#D3D3D3",
    borderRadius: 10,
    backgroundColor: "white",
  },
  circle: {
    width: 15,
    height: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D3D3D3",
    marginRight: 10,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  numberBox: {
    width: 25,
    height: 25,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    color: "white",
    fontWeight: "bold",
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
