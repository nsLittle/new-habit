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
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function FeedbackRequestScreen() {
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
      console.log("Teammember Id: ", teammemberId);
      console.log("First Name: ", firstName);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [selectedRating, setSelectedRating] = useState(null);

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

  const [ratingValue, setRatingValue] = useState("");

  useEffect(() => {
    const checkForExistingRating = async () => {
      console.log(`Checking for existing rating...`);

      try {
        const response = await fetch(
          `http://192.168.1.174:8000/feedback/${username}/:habit_id`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error("No existing habit found.");
          setCadenceInput("");
          setExistingCadence("");
          return false;
        }

        const data = await response.json();
        const existingCadence = data.habits[0]?.cadence || "";
        console.log("Data: ", data);
        console.log("Existing Cadence: ", existingCadence);

        if (existingCadence) {
          setCadenceInput(existingCadence);
          setExistingCadence(existingCadence);
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
    if (!ratingValue) {
      showDialog("Please select a feedback rating.");
      return;
    }

    try {
      console.log("Saving cadence...");
      const response = await fetch(
        `http://192.168.1.174:8000/habit/${username}/${habitId}/cadence`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cadence: cadenceInput,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data: ", data);

      setDialogMessage("Feedback cadence updated successfully.");
      navigation.navigate("ReminderScreen");
    } catch (error) {
      console.error("Error updating feedback cadence:", error);
      setDialogMessage("Failed to update feedback cadence. Please try again.");
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
                selectedRating === rating.value && {
                  borderColor: rating.color,
                  backgroundColor: "#F0F0F0",
                },
              ]}
              onPress={() => setRatingValue(rating.value)}>
              <View
                style={[
                  styles.circle,
                  selectedRating === rating.value && {
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
            style={styles.backButton}
            onPress={() => navigation.navigate("FeedbackRequestTwoScreen")}>
            <Text style={styles.backButtonText} title="Back">
              ◀ Back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={handleSave}>
            <Text style={styles.saveButtonText} title="Save">
              Save
            </Text>
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
  nextButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 150,
    height: 45,
    justifyContent: "center",
  },
  nextButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#D3D3D3",
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
