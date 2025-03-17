import { useContext, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  Alert,
} from "react-native";
import { UserContext } from "../context/UserContext";

export default function FinalReviewScreen() {
  const { userContext } = useContext(UserContext) || {};
  const {
    userNameContext,
    token,
    habitContextId,
    habitContextInput,
    descriptionContextInput,
    habitEndDate,
  } = userContext || {};

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [feedbackData, setFeedbackData] = useState([]);
  const [reflection, setReflection] = useState("");
  const [isLastDay, setIsLastDay] = useState(false);

  useEffect(() => {
    if (habitEndDate) {
      const today = new Date().toISOString().split("T")[0];
      console.log("Today's Date:", today);
      console.log("Habit End Date:", habitEndDate);

      setIsLastDay(today === habitEndDate);
    }
  }, [habitEndDate]);

  console.log("Habit End Date from UserContext:", habitEndDate);

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
      feedbackData.reduce((sum, fb) => sum + fb.feedbackRating, 0) /
      feedbackData.length
    ).toFixed(1);

    const bestFeedback = feedbackData
      .filter((fb) => fb.feedbackRating >= 4)
      .map((fb) => fb.feedbackText);

    const worstFeedback = feedbackData
      .filter((fb) => fb.feedbackRating <= 2)
      .map((fb) => fb.feedbackText);

    return { avgRating, bestFeedback, worstFeedback };
  };

  const feedbackSummary = processFeedback();

  const saveReflection = async () => {
    if (!reflection.trim()) {
      Alert.alert("Reflection is empty", "Please write something.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/habits/${userNameContext}/${habitContextId}/reflection`,
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

      setDialogMessage("Saved!", "Your self-reflection has been recorded.");
      setShowDialog(true);
      setReflection("");
    } catch (error) {
      console.error("Error saving reflection:", error);
    }
  };

  return isLastDay ? (
    <ScrollView contentContainerStyle={styles.container}>
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

      <Button title="Save Reflection" onPress={saveReflection} />

      <View style={{ height: 50 }} />
    </ScrollView>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    padding: 20,
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
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
});
