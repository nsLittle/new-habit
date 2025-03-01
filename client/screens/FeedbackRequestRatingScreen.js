import { useContext, useEffect, useState } from "react";
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function FeedbackRequestRatingScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    username,
    userId,
    habitId,
    habitinput,
    teammemberId,
    firstName,
    token,
  } = userContext || {};
  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("User Name: ", username);
      console.log("User Id: ", userId);
      console.log("Habit Input: ", habitinput);
      console.log("Habit Id: ", habitId);
      console.log("Team Member Id: ", teammemberId);
      console.log("First Name: ", firstName);
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

  console.log("Received from FeedbackRequestTwoScreen:", route.params);
  console.log("Team Member Id: ", teamMemberId);
  console.log("Team Member First Name: ", teamMemberFirstName);
  console.log("Team Member Last Name: ", teamMemberLastName);
  console.log("Team Memeber Email: ", teamMemberEmail);
  console.log("Team Member Profile Pic: ", teamMemberProfilePic);

  const [ratingValue, setRatingValue] = useState("");
  const [existingRating, setExistingRating] = useState("");
  console.log("Rating Value: ", ratingValue);

  const ratings = [
    { value: 1, label: "Significantly Improved", color: "#006400" }, // Dark Green
    { value: 2, label: "Has Improved", color: "#008000" }, // Green
    { value: 3, label: "Slightly Improved", color: "#90EE90" }, // Light Green
    { value: 4, label: "Stayed the Same", color: "#FFD700" }, // Yellow
    { value: 5, label: "Slightly Worsened", color: "#FFA500" }, // Orange
    { value: 6, label: "Observably Worsened", color: "#FF4500" }, // Red-Orange
    { value: 7, label: "Significantly Worsened", color: "#DC143C" }, // Crimson
    { value: 8, label: "Did not Observe", color: "#A9A9A9" }, // Gray
  ];

  useEffect(() => {
    const checkForExistingRating = async () => {
      console.log(`Checking for existing rating...`);

      try {
        const response = await fetch(
          `http://192.168.1.174:8000/feedback/${username}/${habitId}`,
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
        const existingRating = data.habits[0]?.rating || "";
        console.log("Data: ", data);
        console.log("Existing Rating: ", existingRating);

        if (existingRating) {
          setRatingValue(existingRating);
          setExistingRating(existingRating);
          setDialogMessage(
            "ARE YOU SURE YOU WANT TO EDIT YOUR RATING?\n\nPress 'Keep Rating' if you want to retain your current rating."
          );
          setShowDialog(true);
        }
      } catch (error) {
        console.error("Error checking existing rating:", error);
      }
    };
    checkForExistingRating();
  }, []);

  const handleSave = async () => {
    console.log("I'm here saving...");

    if (!ratingValue) {
      setDialogMessage("Please select a feedback rating.");
      setShowDialog(true);
      return;
    }

    try {
      console.log("Saving rating...");
      console.log(
        "Username: ",
        username,
        "and Habit Id: ",
        habitId,
        "from Team Member Id: ",
        teamMemberId
      );
      const feedbackRating = ratingValue;
      console.log("Feedback Rating :", feedbackRating);

      const response = await fetch(
        `http://192.168.1.174:8000/feedback/${username}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            habitId: habitId,
            teamMemberId: teamMemberId,
            feedbackRating: feedbackRating,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data: ", data);

      setDialogMessage("Feedback rating updated successfully.");
      setShowDialog(true);
      console.log("Navigating with params:", {
        teamMemberId,
        teamMemberFirstName,
        teamMemberLastName,
        teamMemberEmail,
        teamMemberProfilePic,
      });
      navigation.navigate("FeedbackRequestThanksRatingScreen", {
        teamMemberId,
        teamMemberFirstName,
        teamMemberLastName,
        teamMemberEmail,
        teamMemberProfilePic,
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
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>
            Rate how well {firstName} has been living their goal
          </Text>
        </View>

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
              onPress={() => {
                setRatingValue(rating.value);
              }}>
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
            <Text style={styles.saveButtonText}>Save ▶</Text>
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
    paddingTop: Platform.OS === "web" ? hp("15%") : hp("2%"),
  },
  titleText: {
    fontSize: 26,
    textAlign: "center",
    paddingBottom: 30,
    fontWeight: "bold",
  },
  dataContainer: {
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: 50,
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
  // backButton: {
  //   backgroundColor: "#D3D3D3",
  //   borderRadius: 25,
  //   paddingVertical: 15,
  //   paddingHorizontal: 20,
  //   alignItems: "center",
  //   width: 150,
  //   height: 45,
  //   justifyContent: "center",
  // },
  // backButtonText: {
  //   color: "black",
  //   fontSize: 12,
  //   textAlign: "center",
  //   fontWeight: "bold",
  // },
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
});
