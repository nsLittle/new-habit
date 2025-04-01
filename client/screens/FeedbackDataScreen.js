import { useContext, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

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
        setFeedbackData(data.feedback || []);
      } catch (error) {
        console.error("Error fetching feedback data:", error);
      }
    };

    if (userNameContext) fetchFeedbackData();
  }, [userNameContext]);

  const getRatingColor = (avgRating) => {
    const rating = parseFloat(avgRating);
    if (rating <= 2) return "#006400"; // Dark Green
    if (rating <= 4) return "#4B4B4B"; // Neutral Gray
    return "#DC143C"; // Crimson
  };

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

    const sortedGroups = Object.values(grouped).sort(
      (a, b) => a.cadenceStart - b.cadenceStart
    );

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
        dateRange: `${start} – ${end}`,
        cycleLable: `(${cycle} set of feedbacks)`,
        averageRating,
        averageThanksRating,
        feedbackTexts: group.feedbacks.map((fb) => fb.feedbackText),
        ratingTrend,
      };
    });

    return labeled.reverse();
  };

  const processedFeedback = processFeedback();

  return (
    <View style={sharedStyles.container}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContainer}>
        <Portal>
          <Dialog
            visible={showDialog}
            onDismiss={() => setShowDialog(false)}
            style={sharedStyles.dialog}>
            <Dialog.Title style={sharedStyles.dialogTitleAlert}>
              Confirm
            </Dialog.Title>
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
                    labelStyle={sharedStyles.dialogButtonCancel}>
                    No
                  </Button>
                  <Button
                    onPress={() => {
                      setShowDialog(false);
                      navigation.navigate("FinalReviewScreen");
                    }}
                    labelStyle={sharedStyles.dialogButtonConfirm}>
                    Yes
                  </Button>
                </>
              ) : (
                <Button
                  onPress={() => setShowDialog(false)}
                  labelStyle={sharedStyles.dialogButtonConfirm}>
                  OK
                </Button>
              )}
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <View style={sharedStyles.body}>
          <Text style={sharedStyles.title}>Feedback Data</Text>
          {processedFeedback.length ? (
            processedFeedback.map((entry, idx) => (
              <View key={idx} style={styles.feedbackPeriod}>
                <Text style={styles.dateRange}>{entry.dateRange}</Text>
                <Text style={styles.ordinalLabel}>{entry.ordinalLabel}</Text>
                <View style={styles.metricRow}>
                  <View style={styles.metricBox}>
                    <Text
                      style={[
                        styles.metricNumber,
                        { color: getRatingColor(entry.averageRating) },
                      ]}>
                      {entry.averageRating}
                    </Text>
                    <Text style={styles.metricLabel}>Rating</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricNumber}>
                      {entry.averageThanksRating}
                    </Text>
                    <Text style={styles.metricLabel}>Thanks</Text>
                  </View>
                </View>
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

          {processedFeedback.lewngth >= 1 && (
            <View style={sharedStyles.buttonRow}>
              <TouchableOpacity
                style={sharedStyles.yellowButton}
                onPress={() => {
                  setDialogMessage(
                    "Do you want to complete your habit and view the final review?"
                  );
                  setDialogAction("completeHabit");
                  setShowDialog(true);
                }}>
                <Text style={sharedStyles.buttonText}>Complete Habit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={sharedStyles.greyButton}
                onPress={() => navigation.navigate("ReviewScreen")}>
                <Text style={sharedStyles.buttonText}>Review Habit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  feedbackPeriod: {
    marginTop: 20,
    padding: 10,
    borderWidth: 2,
    borderRadius: 6,
    width: 300,
    borderColor: "#aaa",
    backgroundColor: "#f9f9f9",
  },
  dateRange: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 0,
  },
  ordinalLabel: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
    color: "#555",
    marginBottom: 10,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  metricBox: {
    alignItems: "center",
    padding: 12,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#aaa",
    width: 125,
  },
  metricNumber: {
    fontSize: 36,
    fontWeight: "bold",
  },
  metricLabel: {
    fontSize: 14,
    color: "#666",
  },
  feedbackText: {
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 3,
  },
});
