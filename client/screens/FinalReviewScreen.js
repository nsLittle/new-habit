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
import { BASE_URL } from "../constants/config";
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

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);

  const [feedbackData, setFeedbackData] = useState([]);
  const [reflection, setReflection] = useState("");
  const [isLastDay, setIsLastDay] = useState(false);

  const [habitMetaData, setHabitMetaData] = useState(null);

  const [hasShownEditDialog, setHasShownEditDialog] = useState(false);

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

  console.log(
    "Fetching habit metadata with URL:",
    `${BASE_URL}/habit/${userNameContext}/${habitContextId}`
  );
  console.log("Token:", token);

  useEffect(() => {
    let isMounted = true;

    const fetchReflection = async () => {
      if (!habitContextId || !userNameContext || !token) return;

      try {
        const response = await fetch(
          `${BASE_URL}/habit/${userNameContext}/${habitContextId}/get-reflection`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          console.log("No existing reflection found.");
          return;
        }

        const data = await response.json();
        console.log("DATA: ", data);

        if (data?.habit?.reflections?.length > 0) {
          const latest = data.habit.reflections.slice(-1)[0];

          if (isMounted && !hasShownEditDialog && latest?.text?.trim()) {
            setReflection(latest.text);
            setDialogMessage(
              "Do you want to edit your existing final reflection?"
            );
            setDialogAction("editOrSkip");
            setShowDialog(true);
            setHasShownEditDialog(true);
          }
        }
      } catch (error) {
        console.error("Error fetching reflection:", error);
      }
    };

    fetchReflection();
  }, []);

  useEffect(() => {
    const fetchHabitMetaData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/habit/${userNameContext}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch habit metadata.");
        const data = await response.json();
        console.log("Habit metadata:", data);
        setHabitMetaData(data);
      } catch (error) {
        console.error("Error fetching habit metadata:", error);
        if (error.response) {
          console.error("Server response:", await error.response.text());
        }
      }
    };

    if (userNameContext && habitContextId && token) {
      fetchHabitMetaData();
    }
  }, [userNameContext, habitContextId, token]);

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
          `${BASE_URL}/feedback/${userNameContext}/${habitContextId}`,
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

  useEffect(() => {
    if (!habitMetaData) return;

    const habit = habitMetaData.habits[0];
    const today = new Date();

    // Get current cycle number and find its start date
    const currentCycle = habit.currentCycle || 1;
    const currentCycleData = habit.habitCycles?.find(
      (cycle) => cycle.cycleNumber === currentCycle
    );

    const cycleStartDate = currentCycleData?.startDate
      ? new Date(currentCycleData.startDate)
      : new Date(habit.startDate);

    const feedbackUnlockDate = new Date(cycleStartDate);
    feedbackUnlockDate.setDate(
      feedbackUnlockDate.getDate() + (habit.habitLength || 90)
    );

    setIsLastDay(today >= feedbackUnlockDate);
    console.log("Today:", today);
    console.log("Cycle start:", cycleStartDate);
    console.log("Feedback unlock date:", feedbackUnlockDate);
    console.log("isLastDay:", today >= feedbackUnlockDate);

    const latestReflection = habit.reflections?.slice(-1)[0]?.text;
    if (latestReflection) {
      setReflection(latestReflection);
    }
  }, [habitMetaData]);

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
        `${BASE_URL}/habit/${userNameContext}/${habitContextId}/save-reflection`,
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
      setDialogAction("masteryCheck");
      setShowDialog(true);
    } catch (error) {
      console.error("Error saving reflection:", error);
    }
  };

  const completeHabitCycle = async (markComplete) => {
    try {
      const response = await fetch(
        `${BASE_URL}/habit/${userNameContext}/${habitContextId}/complete-cycle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ markComplete }),
        }
      );

      const data = await response.json();
      console.log("Cycle complete response:", data);

      if (!response.ok) throw new Error("Failed to complete habit cycle.");

      if (markComplete) {
        // ✅ User is done with this habit
        navigation.navigate("SuccessfulHabitCompletionScreen");
      } else {
        // 🔁 User wants to repeat the habit
        navigation.navigate("CreateHabitScreen");
      }
    } catch (error) {
      console.error("Error updating habit cycle:", error);
      setDialogMessage("Something went wrong updating the habit cycle.");
      setShowDialog(true);
    }
  };

  const startNewHabitCycle = async () => {
    try {
      const response = await fetch(
        `${YOUR_API_BASE_URL}/habits/${habitIdContext}/start-new-cycle`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to start new cycle");

      navigation.navigate("StartNewHabitScreen");
    } catch (error) {
      console.error("Error starting new habit cycle:", error.message);
      Alert.alert("Error", error.message);
    }
  };

  return (
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
            {dialogAction === "editOrSkip" ? (
              <>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                    navigation.navigate("SuccessfulHabitCompletionScreen");
                  }}
                  labelStyle={styles.dialogButtonNo}>
                  NO
                </Button>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                  }}
                  labelStyle={styles.dialogButton}>
                  YES
                </Button>
              </>
            ) : dialogAction === "masteryCheck" ? (
              <>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                    completeHabitCycle(true);
                  }}
                  labelStyle={styles.dialogButton}>
                  YES
                </Button>
                <Button
                  onPress={() => {
                    navigation.navigate(NextTimeScreen);
                  }}
                  labelStyle={styles.dialogButtonNo}>
                  NO
                </Button>
              </>
            ) : (
              // ) : dialogAction === "repeatCheck" ? (
              //   <>
              //     <Button
              //       onPress={() => {
              //         setShowDialog(false);
              //         startNewHabitCycle();
              //       }}
              //       labelStyle={styles.dialogButton}>
              //       YES
              //     </Button>
              //     <Button
              //       onPress={() => {
              //         setShowDialog(false);
              //         navigation.navigate("SuccessfulHabitCompletionScreen");
              //       }}
              //       labelStyle={styles.dialogButtonNo}>
              //       NO
              //     </Button>
              //   </>
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
