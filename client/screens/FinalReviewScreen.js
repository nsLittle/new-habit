import { useContext, useEffect, useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Button, Dialog, Portal } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function FinalReviewScreen() {
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
    habitContextEndDate,
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
      console.log("Habit End Date: ", habitContextEndDate);
      console.log("Description Input Context: ", descriptionContextInput);
      console.log("TeamMember Id Context: ", teamMemberContextId);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);

  const [feedbackData, setFeedbackData] = useState([]);
  const [reflection, setReflection] = useState("");
  const [isLastDay, setIsLastDay] = useState(false);

  useEffect(() => {
    if (habitContextEndDate) {
      const today = new Date().toISOString().split("T")[0];
      console.log("Today's Date:", today);
      console.log("Habit End Date:", habitContextEndDate);
      const convertedHabitContextEndDate = new Date(habitContextEndDate)
        .toISOString()
        .split("T")[0];
      console.log("Converted Habit End Date: ", convertedHabitContextEndDate);

      setIsLastDay(today >= convertedHabitContextEndDate);
    }
  }, [habitContextEndDate]);

  console.log("Habit End Date from UserContext:", habitContextEndDate);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!token) return;
      try {
        console.log(
          "Fetching feedback for user:",
          userNameContext,
          "Habit:",
          habitContextId
        );
        const response = await fetch(
          `http://localhost:8000/feedback/${userNameContext}/${habitContextId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error("Failed to fetch feedback data.");
        const data = await response.json();
        console.log("Fetched Feedback Data:", data);
        setFeedbackData(data.feedback || []);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    if (isLastDay && userNameContext) fetchFeedbackData();
  }, [isLastDay, userNameContext]);

  const processFeedback = () => {
    if (!feedbackData.length) return null;

    const avgRating = (
      feedbackData.reduce((sum, fb) => sum + fb.rating, 0) / feedbackData.length
    ).toFixed(1);

    const avgThanksRating = (
      feedbackData.reduce((sum, fb) => sum + fb.thanksRating, 0) /
      feedbackData.length
    ).toFixed(1);

    const bestFeedback = feedbackData
      .filter((fb) => fb.rating <= 2)
      .map((fb) => fb.text);

    const worstFeedback = feedbackData
      .filter((fb) => fb.rating >= 2)
      .map((fb) => fb.text);

    return { avgRating, bestFeedback, worstFeedback };
  };

  const feedbackSummary = processFeedback();

  const saveReflection = async () => {
    if (!reflection.trim()) {
      setDialogMessage("Reflection is empty. Please write something.");
      setShowDialog(true);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/habit/${userNameContext}/${habitContextId}/save-reflection`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: reflection }),
        }
      );

      if (!response.ok) throw new Error("Failed to save reflection.");

      console.log("Response: ", response);

      const data = await response.json();
      console.log("Data: ", data);

      if (data.message === "Duplicate reflection detected") {
        setDialogMessage("Reflection already exists.");
        setShowDialog(true);
        return;
      }

      setDialogMessage("Do you feel like you have mastered this habit?");
      setShowDialog(true);
      setDialogAction("masteryCheck");
    } catch (error) {
      console.error("Error saving reflection:", error);
    }
  };

  const updateHabitCycle = async (markComplete) => {
    try {
      const response = await fetch(
        `http://localhost:8000/habit/${userNameContext}/${habitContextId}/complete-cycle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ markComplete }),
        }
      );

      console.log("Response: ", response);
      const data = await response.json();
      console.log("Data: ", data);

      if (!response) throw new Error("Failed to update habit cycle.");
      const updatedHabit = await response.json();

      if (data) {
        console.log("Successful habit completion!");
        navigation.navigate("SuccessfulHabitCompletionScreen");
      } else {
        if (updatedHabit.currentCycle >= 3) {
          setDialogMessage(
            "Cycle Limit Reached",
            "You have completed all habit cycles."
          );
          setShowDialog(true);
          navigation.navigate("SuccessfulHabitCompletionScreen");
        } else {
          setDialogMessage("Habit Extended", "Your habit has been extended.");
          setShowDialog(true);
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error("Error updating habit cycle:", error);
      setDialogMessage("Error", "Could not update habit cycle.");
      setShowDialog(true);
    }
  };

  return isLastDay ? (
    <ScrollView contentContainerStyle={styles.container}>
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Confirm</Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage || "Are you sure?"}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            {dialogAction === "masteryCheck" ? (
              <>
                <Button
                  onPress={() => {
                    console.log("YES pressed");
                    updateHabitCycle(true);
                  }}
                  labelStyle={styles.dialogButton}>
                  YES
                </Button>

                <Button
                  onPress={() => updateHabitCycle(false)}
                  labelStyle={styles.dialogButtonNo}>
                  NO
                </Button>
              </>
            ) : (
              <Button
                onPress={() => setShowDialog(false)}
                labelStyle={styles.dialogButton}>
                OK
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.body}>
        <Text style={styles.title}>Final Review</Text>
        <Text style={styles.subtitle}>{habitContextInput}</Text>
        <Text style={styles.description}>{descriptionContextInput}</Text>

        {feedbackSummary ? (
          <View style={styles.feedbackSection}>
            <Text style={styles.header}>Feedback Summary</Text>
            <Text>Average Rating: {feedbackSummary.avgRating}</Text>

            <Text style={styles.subHeader}>Best Feedback:</Text>
            {feedbackSummary.bestFeedback.length ? (
              feedbackSummary.bestFeedback.map((text, index) => (
                <Text key={index} style={styles.feedbackText}>
                  - {text}
                </Text>
              ))
            ) : (
              <Text>No positive feedback recorded.</Text>
            )}

            <Text style={styles.subHeader}>Areas for Improvement:</Text>
            {feedbackSummary.worstFeedback.length ? (
              feedbackSummary.worstFeedback.map((text, index) => (
                <Text key={index} style={styles.feedbackText}>
                  - {text}
                </Text>
              ))
            ) : (
              <Text>No critical feedback recorded.</Text>
            )}
          </View>
        ) : (
          <Text>No feedback available.</Text>
        )}

        <Text style={styles.subHeader}>Your Reflection:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Write your reflection here..."
          multiline
          value={reflection}
          onChangeText={setReflection}
        />

        <View style={styles.buttonColumn}>
          <TouchableOpacity style={styles.button} onPress={saveReflection}>
            <Text style={styles.buttonText}>Save ▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  ) : null;
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: "white",
  },
  dialogTitle: {
    color: "red",
    fontWeight: "bold",
  },
  dialogButtonNo: {
    color: "red",
    fontWeight: "bold",
    fontSize: 18,
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
  title: {
    fontSize: 26,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },
  feedbackSection: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderRadius: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  feedbackText: {
    fontStyle: "italic",
    marginLeft: 10,
  },
  textInput: {
    height: 100,
    width: "85%",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
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
  button: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 300,
    height: 45,
    justifyContent: "center",
  },
  buttonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
  },
});
