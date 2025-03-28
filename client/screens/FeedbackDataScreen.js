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
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";

export default function FeedbackDataScreen() {
  const navigation = useNavigation();
  const { userContext } = useContext(UserContext) || {};
  const { userNameContext, token, habitContextId } = userContext || {};

  const [feedbackData, setFeedbackData] = useState([]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);

  useEffect(() => {
    if (!habitContextId) return;
    const fetchFeedbackData = async () => {
      if (!token) return;
      try {
        const response = await fetch(
          `${BASE_URL}/feedback/${userNameContext}/${habitContextId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch feedback data.");
        const data = await response.json();
        // console.log("Data: ", data);
        setFeedbackData(data.feedback || []);
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      }
    };

    if (userNameContext) fetchFeedbackData();
  }, [userNameContext]);

  const getOrdinalSuffix = (n) => {
    const j = n % 10,
      k = n % 100;
    if (j === 1 && k !== 11) return `${n}st`;
    if (j === 2 && k !== 12) return `${n}nd`;
    if (j === 3 && k !== 13) return `${n}rd`;
    return `${n}th`;
  };

  const processFeedback = () => {
    if (!feedbackData.length) return [];

    const grouped = {};
    feedbackData.forEach((fb) => {
      const key = `${fb.cadenceStart}-${fb.cadenceEnd}`;
      if (!grouped[key]) {
        grouped[key] = {
          feedbacks: [],
          ratingTotal: 0,
          thanksTotal: 0,
          cadenceStart: new Date(fb.cadenceStart),
          cadenceEnd: new Date(fb.cadenceEnd),
        };
      }
      grouped[key].feedbacks.push(fb);
      grouped[key].ratingTotal += fb.feedbackRating;
      grouped[key].thanksTotal += fb.feedbackThanksRating;
    });

    // Step 1: sort oldest to newest
    const sortedGroups = Object.values(grouped).sort(
      (a, b) => a.cadenceStart - b.cadenceStart
    );

    // Step 2: assign correct ordinal labels
    const labeled = sortedGroups.map((group, index, arr) => {
      const count = group.feedbacks.length;
      const averageRating = (group.ratingTotal / count).toFixed(1);
      const averageThanksRating = (group.thanksTotal / count).toFixed(1);

      const previous =
        index > 0
          ? (
              arr[index - 1].ratingTotal / arr[index - 1].feedbacks.length
            ).toFixed(1)
          : null;
      const ratingTrend = previous
        ? averageRating > previous
          ? "up"
          : averageRating < previous
          ? "down"
          : "same"
        : null;

      const start = group.cadenceStart.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const end = group.cadenceEnd.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const cycle = getOrdinalSuffix(index + 1);

      return {
        dateRange: `${start} – ${end} (${cycle} set of feedbacks)`,
        averageRating,
        averageThanksRating,
        feedbackTexts: group.feedbacks.map((fb) => fb.feedbackText),
        ratingTrend,
      };
    });

    // Step 3: reverse again for display (most recent first)
    return labeled.reverse();
  };

  const processedFeedback = processFeedback();

  // console.log("Processed feedback count:", processedFeedback.length);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Portal>
          <Dialog
            visible={showDialog}
            onDismiss={() => setShowDialog(false)}
            style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>Confirm</Dialog.Title>
            <Dialog.Content>
              <Text>
                {dialogMessage ||
                  "Do you want to complete your habit and view the final review?"}
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              {dialogAction === "completeHabit" ? (
                <>
                  <Button
                    onPress={() => setShowDialog(false)}
                    labelStyle={styles.dialogButtonNo}>
                    No
                  </Button>
                  <Button
                    onPress={() => {
                      setShowDialog(false);
                      navigation.navigate("FinalReviewScreen");
                    }}
                    labelStyle={styles.dialogButton}>
                    Yes
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
          <Text style={styles.title}>Feedback Data</Text>
          {processedFeedback.length ? (
            processedFeedback.map((entry, idx) => (
              <View key={idx} style={styles.feedbackPeriod}>
                <Text style={styles.feedbackHeader}>{entry.dateRange}</Text>
                <Text style={styles.prominentMetric}>
                  Avg Rating: {entry.averageRating}
                  {entry.ratingTrend === "up" && (
                    <Text style={styles.upArrow}> ↑</Text>
                  )}
                  {entry.ratingTrend === "down" && (
                    <Text style={styles.downArrow}> ↓</Text>
                  )}
                </Text>
                <Text style={styles.prominentMetric}>
                  Avg Thanks: {entry.averageThanksRating}
                </Text>
                {entry.feedbackTexts.map((text, i) => (
                  <Text key={i} style={styles.feedbackText}>
                    "{text}"
                  </Text>
                ))}
              </View>
            ))
          ) : (
            <Text>No feedback available.</Text>
          )}

          {processedFeedback.length >= 1 && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  setDialogMessage(
                    "Do you want to complete your habit and view the final review?"
                  );
                  setDialogAction("completeHabit");
                  setShowDialog(true);
                }}>
                <Text style={styles.buttonText}>Review & Complete Habit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
    flex: 1,
    backgroundColor: "white",
  },
  body: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingTop: Platform.OS === "web" ? hp("20%") : hp("2%"),
  },
  button: {
    marginTop: 40,
    width: "90%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 220,
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 20,
  },
  feedbackPeriod: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    width: "90%",
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  feedbackHeader: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  prominentMetric: {
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 5,
    color: "#4B0082",
    textAlign: "center",
  },
  feedbackText: {
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 3,
  },
  upArrow: {
    color: "green",
    fontSize: 28,
  },
  downArrow: {
    color: "red",
    fontSize: 28,
  },
  buttonRow: {
    marginTop: 40,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: "black",
    fontSize: 14,
    textAlign: "center",
  },
});
