import { useContext, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

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
          return;
        }

        const data = await response.json();

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
        const response = await fetch(
          `${BASE_URL}/feedback/${userNameContext}/${habitContextId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error("Failed to fetch feedback data.");
        const data = await response.json();
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

  const saveReflection = async (mastered = null) => {
    if (!reflection.trim()) {
      setDialogMessage("Reflection is empty. Please write something.");
      setShowDialog(true);
      return;
    }

    if (!isCycleComplete()) {
      setDialogMessage(
        "Your habit cycle isn't over yet.\nDo you still want to complete your reflection now?"
      );
      setDialogAction("earlyReflection");
      setShowDialog(true);
      return;
    }

    submitReflection();
  };

  const submitReflection = async (mastered = null) => {
    try {
      const response = await fetch(
        `${BASE_URL}/habit/${userNameContext}/${habitContextId}/save-reflection`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: reflection, mastered }),
        }
      );

      const data = await response.json();
      console.log("Data: ", data);

      if (!response.ok) throw new Error("Failed to save reflection.");

      if (data.message === "Duplicate reflection detected") {
        setDialogMessage("Reflection already exists.");
        setShowDialog(true);
        return;
      }

      if (mastered === null) {
        setDialogMessage("Do you feel like you have mastered this habit?");
        setDialogAction("masteryCheck");
        setShowDialog(true);
      }
    } catch (error) {
      console.error("Error saving reflection:", error);
      setDialogMessage("Error saving reflection.");
      setShowDialog(true);
    }
  };

  // const saveReflection = async () => {
  //   console.log(`I'm here saving reflection...`);

  //   if (!reflection.trim()) {
  //     setDialogMessage("Reflection is empty. Please write something.");
  //     setShowDialog(true);
  //     return;
  //   }

  //   console.log("Username; ", userNameContext, "Habit ID: ", habitContextId);

  //   try {
  //     const response = await fetch(
  //       `${BASE_URL}/habit/${userNameContext}/${habitContextId}/save-reflection`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({ text: reflection }),
  //       }
  //     );
  //     console.log("Response: ", response);

  //     if (!response.ok) throw new Error("Failed to save reflection.");

  //     const data = await response.json();

  //     console.log("Data: ", data);

  //     if (data.message === "Duplicate reflection detected") {
  //       setDialogMessage("Reflection already exists.");
  //       setShowDialog(true);
  //       return;
  //     }

  //     setDialogMessage("Do you feel like you have mastered this habit?");
  //     setDialogAction("masteryCheck");
  //     setShowDialog(true);
  //   } catch (error) {
  //     console.error("Error saving reflection:", error);
  //   }
  // };

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

      if (!response.ok) throw new Error("Failed to complete habit cycle.");

      if (markComplete) {
        navigation.navigate("SuccessfulHabitCompletionScreen");
      } else {
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
        `${BASE_URL}/habits/${habitContextId}/start-new-cycle`,
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

  const isCycleComplete = () => {
    if (!habitContextEndDate) return false;

    const today = new Date();
    const endDate = new Date(habitContextEndDate);

    return today >= endDate;
  };

  return (
    <ScrollView contentContainerStyle={sharedStyles.container}>
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={sharedStyles.dialog}>
          <Dialog.Title style={sharedStyles.dialogTitleAlert}>
            Confirm
          </Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage || "Are you sure?"}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            {dialogAction === "earlyReflection" ? (
              <>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                  }}
                  labelStyle={sharedStyles.dialogButtonCancel}>
                  Cancel
                </Button>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                    submitReflection();
                  }}
                  labelStyle={sharedStyles.dialogButtonConfirm}>
                  Proceed
                </Button>
              </>
            ) : dialogAction === "editOrSkip" ? (
              <>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                    navigation.navigate("SuccessfulHabitCompletionScreen");
                  }}
                  labelStyle={sharedStyles.dialogButtonCancel}>
                  NO
                </Button>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                  }}
                  labelStyle={sharedStyles.dialogButtonConfirm}>
                  YES
                </Button>
              </>
            ) : dialogAction === "masteryCheck" ? (
              <>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                    submitReflection(true);
                  }}
                  labelStyle={sharedStyles.dialogButtonConfirm}>
                  YES
                </Button>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                    submitReflection(false);
                  }}
                  labelStyle={sharedStyles.dialogButtonCancel}>
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

      <View style={sharedStyles.body}>
        <Text style={sharedStyles.title}>Final Review</Text>

        <Text style={sharedStyles.bodyText}>Your Reflection:</Text>
        <TextInput
          style={sharedStyles.input}
          placeholder="Write your reflection here..."
          multiline
          value={reflection}
          onChangeText={setReflection}
        />

        <View style={sharedStyles.buttonColumn}>
          <TouchableOpacity
            style={sharedStyles.yellowButton}
            onPress={saveReflection}>
            <Text style={sharedStyles.buttonText}>Save ▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
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
});
