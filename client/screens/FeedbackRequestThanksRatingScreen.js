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
import { BASE_URL } from "../constants/config";
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

  // useEffect(() => {
  //   if (userContext) {
  //     console.log("UserContext:", userContext);
  //     console.log("User Id Context: ", userIdContext);
  //     console.log("UserName Context: ", userNameContext);
  //     console.log("First Name Context: ", firstNameContext);
  //     console.log("Last Name Context: ", lastNameContext);
  //     console.log("Email Context: ", emailContext);
  //     console.log("Profile Pic Context: ", profilePicContext);
  //     console.log("Habit Id Context: ", habitContextId);
  //     console.log("Habit Input Context: ", habitContextInput);
  //     console.log("Description Input Context: ", descriptionContextInput);
  //     console.log("TeamMember Id Context: ", teamMemberContextId);
  //     console.log("Token: ", token);
  //   }
  // }, [userContext]);

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

  // console.log("Received from FeedbackWelcomeScreen:", route.params);
  // console.log("Team Member Id: ", teamMemberRouteId);
  // console.log("Team Member First Name: ", teamMemberRouteFirstName);
  // console.log("Team Member Last Name: ", teamMemberRouteLastName);
  // console.log("Team Memeber Email: ", teamMemberRouteEmail);
  // console.log("Team Member Profile Pic: ", teamMemberRouteProfilePic);

  const [ratingValue, setRatingValue] = useState("");
  const [existingRating, setExistingRating] = useState("");
  // console.log("Rating Value: ", ratingValue);

  const ratings = [
    { value: 5, label: "No perceptible follow-up", color: "#DC143C" }, // Crimson
    { value: 4, label: "Little follow-up", color: "#FF4500" }, // Red-Orange
    { value: 3, label: "Some follow-up", color: "#FFD700" }, // Yellow
    { value: 3, label: "Frequent follow-up", color: "#90EE90" }, // Light Green
    { value: 1, label: "Constructive follow-up", color: "#008000" }, // Green
  ];

  useEffect(() => {
    const checkForExistingThanksRating = async () => {
      // console.log(`Checking for existing thanks rating...`);

      try {
        const response = await fetch(
          `${BASE_URL}/feedback/${userNameContext}/${habitContextId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error("No existing rating found.");
          setRatingValue("");
          setExistingRating("");
          return false;
        }

        const data = await response.json();
        // console.log("Data: ", data);
      } catch (error) {
        console.error("Error checking existing rating:", error);
      }
    };
    checkForExistingThanksRating();
  }, []);

  const handleSave = async () => {
    // console.log("I'm here saving thanks rating...");

    if (!ratingValue) {
      setDialogMessage("Please select a feedback thanks rating.");
      setShowDialog(true);
      return;
    }

    try {
      // console.log("Saving thanks rating...");
      // console.log(
      //   "Username: ",
      //   userNameContext,
      //   "and Habit Id: ",
      //   habitContextId,
      //   "from Team Member Id: ",
      //   teamMemberRouteId
      // );
      const feedbackThanksRating = ratingValue;
      // console.log("Feedback Thanks Rating :", feedbackThanksRating);

      const resolvedTeamMemberId = teamMemberRouteId;

      if (!resolvedTeamMemberId) {
        console.error(
          "❌ ERROR: `teamMemberContextId` is missing before sending request."
        );
        setDialogMessage("Error: Team member ID is missing.");
        setShowDialog(true);
        return;
      }

      // console.log("✅ Using Team Member Id:", resolvedTeamMemberId);

      const response = await fetch(
        `${BASE_URL}/feedback/${userNameContext}/${habitContextId}/thanks-rating`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            habitContextId: [habitContextId],
            teamMemberContextId: resolvedTeamMemberId,
            feedbackThanksRating: feedbackThanksRating,
          }),
        }
      );

      const data = await response.json();
      // console.log("Data: ", data);

      setDialogMessage("Feedback thanks rating updated successfully.");
      setShowDialog(true);
      // console.log("Navigating with params:", {
      //   teamMemberRouteId,
      //   teamMemberRouteFirstName,
      //   teamMemberRouteLastName,
      //   teamMemberRouteEmail,
      //   teamMemberRouteProfilePic,
      // });
      navigation.navigate("FeedbackRequestQualitativeScreen", {
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

          <View style={styles.buttonColumn}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                // console.log("Save button pressed");
                handleSave();
              }}>
              <Text>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.noThanksButton}
              onPress={() => {
                // console.log("Team member declines feedback request.");
                resetUserContext("NoThankYouScreen");
                navigation.navigate("NoThankYouScreen", {});
              }}>
              <Text style={styles.noThanksButtonText} title="No Thanks">
                No Thnaks
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
  buttonColumn: {
    flexDirection: "column",
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
  noThanksButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 150,
    height: 45,
    justifyContent: "center",
  },
  noThanksButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
});
