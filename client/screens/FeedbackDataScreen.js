import { useContext, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { UserContext } from "../context/UserContext";

export default function FeedbackDataScreenScreen() {
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
      console.log("Description Input Context: ", descriptionContextInput);
      console.log("TeamMember Id Context: ", teamMemberContextId);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const route = useRoute();
  const {
    teamMemberRouteId,
    teamMemberRouteFirstName,
    teamMemberRouteLastName,
    teamMemberRouteEmail,
    teamMemberRouteProfilePic,
  } = route.params || {};

  console.log("Received from FeedbackWelcomeScreen:", route.params);
  console.log("Team Member Id: ", teamMemberRouteId);
  console.log("Team Member First Name: ", teamMemberRouteFirstName);
  console.log("Team Member Last Name: ", teamMemberRouteLastName);
  console.log("Team Memeber Email: ", teamMemberRouteEmail);
  console.log("Team Member Profile Pic: ", teamMemberRouteProfilePic);

  const [feedbackData, setFeedbackData] = useState([]);

  const fetchFeedbackData = async () => {
    console.log("I'm here to fetch feedback request data...");
    try {
      if (!token) {
        console.warn("Authentication token is missing. Skipping API calls.");
        return;
      }

      const [feedbackResponse] = await Promise.all([
        fetch(
          `https://new-habit-69tm.onrender.com/feedback/${userNameContext}/${habitContextId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      if (!feedbackResponse.ok)
        throw new Error("Failed to fetch feedback data.");

      const feedbackData = await feedbackResponse.json();

      if (!Array.isArray(feedbackData.feedback)) {
        console.error("Unexpected API response format:", data);
        return;
      }

      setFeedbackData(feedbackData.feedback);

      console.log("Feedback Data: ", feedbackData);
    } catch (error) {
      console.error("Error with data retrieval:", error);
    }
  };

  useEffect(() => {
    if (userNameContext) {
      fetchFeedbackData();
    }
  }, [userNameContext]);

  useEffect(() => {
    console.log("Updated Feedback Data:", feedbackData);
  }, [feedbackData]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>Feedback Data</Text>
        </View>

        <View style={styles.bodyIntroContainer}>
          <Text style={styles.bodyIntroText}>Stuff and stuff</Text>

          <View>
            {feedbackData.length === 0 ? (
              <Text>No feedback available.</Text>
            ) : (
              <FlatList
                data={feedbackData}
                keyExtractor={(item) =>
                  item._id?.toString() || Math.random().toString()
                }
                renderItem={({ item }) => (
                  <View style={{ padding: 10, borderBottomWidth: 1 }}>
                    <Text>Team Member ID: {item.teamMemberId}</Text>
                    <Text>Feedback Rating: {item.feedbackRating}</Text>
                    <Text>
                      Feedback Thanks Rating:{" "}
                      {item.feedbackThanksRating || "N/A"}
                    </Text>
                    <Text>
                      Feedback Text: {item.feedbackText || "No text provided"}
                    </Text>
                    <Text>
                      Feedback Date:{" "}
                      {new Date(item.feedbackDate).toLocaleString()}
                    </Text>
                  </View>
                )}
              />
            )}
          </View>
          <View style={styles.buttonRow}></View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  bodyTitleText: {
    fontSize: 26,
    textAlign: "center",
    paddingBottom: 30,
    fontWeight: "bold",
  },
  bodyIntroContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  bodyIntroText: {
    textAlign: "center",
    fontSize: 14,
    paddingBottom: 15,
    width: 225,
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
});
