import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function FeedbackDataScreen() {
  const navigation = useNavigation();
  const { userContext } = useContext(UserContext) || {};
  const { userNameContext, token, habitContextId } = userContext || {};

  const [feedbackData, setFeedbackData] = useState([]);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!token) return;
      try {
        const response = await fetch(
          `http://localhost:8000/feedback/${userNameContext}/${habitContextId}`,
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
      grouped[key].ratingTotal += fb.rating;
      grouped[key].thanksTotal += fb.thanksRating;
    });

    const sortedGroups = Object.values(grouped).sort(
      (a, b) => a.cadenceStart - b.cadenceStart
    );

    return sortedGroups.map((group, index) => {
      const count = group.feedbacks.length;
      const averageRating = (group.ratingTotal / count).toFixed(1);
      const averageThanksRating = (group.thanksTotal / count).toFixed(1);

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
        feedbackTexts: group.feedbacks.map((fb) => fb.text),
      };
    });
  };

  const processedFeedback = processFeedback();

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ flex: 1 }}>
      <View style={styles.body}>
        <Text style={styles.title}>Feedback Data</Text>
        {processedFeedback.length ? (
          processedFeedback.map((entry, idx) => (
            <View key={idx} style={styles.feedbackPeriod}>
              <Text style={styles.feedbackHeader}>{entry.dateRange}</Text>
              <Text style={styles.prominentMetric}>
                Avg Rating: {entry.averageRating}
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "white",
    paddingTop: 100,
  },
  title: {
    fontSize: 26,
    textAlign: "center",
    paddingBottom: 10,
    fontWeight: "bold",
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  prominentMetric: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 5,
    color: "#4B0082",
  },
  feedbackText: {
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 3,
  },
});
