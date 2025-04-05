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
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

export default function FeedbackRequestRatingScreen() {
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
  } = userContext || {};

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const route = useRoute();
  const { teammemberId, token } = route.params || {};

  if (!teammemberId) {
    console.error("❌ ERROR: No teammemberId found in route params.");
    return null;
  }

  const [ratingValue, setRatingValue] = useState("");
  const [existingRating, setExistingRating] = useState("");

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
          console.log("No existing rating found - yay.");
          return;
        }

        const data = await response.json();
        const existingFeedback = data?.feedback?.find(
          (fb) => fb.teammemberId === teammemberId
        );

        if (existingFeedback?.feedbackRating) {
          console.log(
            "Found existing rating:",
            existingFeedback.feedbackRating
          );
          setRatingValue(existingFeedback.feedbackRating);
          setExistingRating(existingFeedback.feedbackRating);
        }
      } catch (error) {
        console.error("Error checking existing rating:", error);
      }
    };
    checkForExistingRating();
  }, []);

  const handleSave = async () => {
    if (!ratingValue) {
      setDialogMessage("Please select a feedback rating.");
      setShowDialog(true);
      return;
    }

    try {
      const feedbackRating = ratingValue;

      if (!teammemberId) {
        console.error(
          "❌ ERROR: `teamMemberContextId` is missing before sending request."
        );
        setDialogMessage("Error: Team member ID is missing.");
        setShowDialog(true);
        return;
      }

      const url = `${BASE_URL}/feedback/${userNameContext}/${habitContextId}/${teammemberId}/submit`;

      const response = await fetch(
        url,

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            habitContextId,
            teammemberId,
            feedbackRating: feedbackRating,
          }),
        }
      );

      const data = await response.json();

      setDialogMessage("Feedback rating updated successfully.");
      setShowDialog(true);
      navigation.navigate("FeedbackRequestThanksRatingScreen", {
        teamMemberRouteId: teammemberId,
      });
    } catch (error) {
      setDialogMessage("Failed to update rating. Please try again.");
      setShowDialog(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={sharedStyles.container}>
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={sharedStyles.dialog}>
          <Dialog.Title style={sharedStyles.dialogTitleAlert}>
            Alert
          </Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowDialog(false)}
              labelStyle={sharedStyles.dialogButtonConfirm}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={sharedStyles.body}>
        <View style={sharedStyles.titleContainer}>
          <Text style={styles.title}>
            Rate how well {firstNameContext} has been living their goal
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

        <View style={sharedStyles.buttonColumn}>
          <TouchableOpacity
            style={sharedStyles.yellowButton}
            onPress={() => {
              console.log("🟡 Save button pressed");
              handleSave();
            }}>
            <Text style={sharedStyles.buttonText}>Save ▶</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={sharedStyles.greyButton}
            onPress={() => {
              navigation.navigate("NoThankYouScreen", {});
            }}>
            <Text style={sharedStyles.buttonText} title="No Thanks">
              No Thanks
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
