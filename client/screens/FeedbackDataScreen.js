import { useContext, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  Platform,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function FeedbackDataScreen() {
  const navigation = useNavigation();
  const { userContext } = useContext(UserContext) || {};
  const {
    userNameContext,
    token,
    habitContextId,
    habitContextInput,
    descriptionContextInput,
  } = userContext || {};

  const [feedbackData, setFeedbackData] = useState([]);
  const [teammemberData, setTeammemberData] = useState([]);

  const [habitEndDate, setHabitEndDate] = useState(null);
  const [isLastDay, setIsLastDay] = useState(false);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!token) return;
      try {
        const [feedbackResponse, teammemberResponse] = await Promise.all([
          fetch(
            `http://localhost:8000/feedback/${userNameContext}/${habitContextId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(`http://localhost:8000/teammember/${userNameContext}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!feedbackResponse.ok)
          throw new Error("Failed to fetch feedback data.");
        const feedbackJson = await feedbackResponse.json();
        setFeedbackData(feedbackJson.feedback || []);

        if (!teammemberResponse.ok)
          throw new Error("Failed to fetch team member data.");
        const teammemberJson = await teammemberResponse.json();
        setTeammemberData(teammemberJson.teamMembers || []);
      } catch (error) {
        console.error("Error with data retrieval:", error);
      }
    };

    if (userNameContext) fetchFeedbackData();
  }, [userNameContext]);

  const processFeedback = () => {
    const periods = {};

    feedbackData.forEach((feedback) => {
      const periodKey = new Date(feedback.feedbackDate)
        .toISOString()
        .slice(0, 10);
      if (!periods[periodKey])
        periods[periodKey] = { ratings: [], thanksRatings: [], texts: [] };

      periods[periodKey].ratings.push(feedback.feedbackRating);
      periods[periodKey].thanksRatings.push(feedback.feedbackThanksRating);
      periods[periodKey].texts.push(feedback.feedbackText);
    });

    const sortedKeys = Object.keys(periods).sort();

    return sortedKeys.map((key, index) => {
      const avgRating = (
        periods[key].ratings.reduce((a, b) => a + b, 0) /
        periods[key].ratings.length
      ).toFixed(1);

      const avgThanks = (
        periods[key].thanksRatings.reduce((a, b) => a + b, 0) /
        periods[key].thanksRatings.length
      ).toFixed(1);

      // Fix: Instead of referencing 'processed', use sortedKeys[index - 1] safely
      const prevKey = sortedKeys[index - 1];
      const prevRating = prevKey
        ? parseFloat(
            periods[prevKey].ratings.reduce((a, b) => a + b, 0) /
              periods[prevKey].ratings.length
          )
        : null;

      const trendIcon =
        index === 0
          ? "➖"
          : avgRating > prevRating
          ? "✅"
          : avgRating < prevRating
          ? "🆘"
          : "⚖️";

      return {
        period: key,
        avgRating,
        avgThanks,
        trendIcon,
        texts: periods[key].texts,
      };
    });
  };

  const processed = processFeedback();

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={true}>
      <View style={styles.body}>
        <Text style={styles.title}>Feedback Data</Text>
        {/* <Text style={styles.subtitle}>{habitContextInput}</Text>
        <Text style={styles.subtitle}>{descriptionContextInput}</Text> */}

        {processed.length === 0 ? (
          <Text>No feedback available.</Text>
        ) : (
          processed.map(
            ({ period, avgRating, avgThanks, trendIcon, texts }) => (
              <View key={period} style={styles.feedbackPeriod}>
                <Text style={styles.feedbackHeader}>
                  {period} {trendIcon}
                </Text>
                <Text>Average Rating: {avgRating}</Text>
                <Text>Average Thanks Rating: {avgThanks}</Text>
                {texts.map((text, i) => (
                  <Text key={i} style={styles.feedbackText}>
                    - {text}
                  </Text>
                ))}
              </View>
            )
          )
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
    paddingTop: 250,
  },
  title: {
    fontSize: 26,
    textAlign: "center",
    paddingBottom: 10,
    fontWeight: "bold",
  },
  subtitle: { fontSize: 16, textAlign: "center", paddingBottom: 5 },
  feedbackPeriod: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    width: "90%",
  },
  feedbackHeader: { fontSize: 18, fontWeight: "bold" },
  feedbackText: { marginLeft: 10, fontStyle: "italic" },
});
