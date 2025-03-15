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
import {
  getFocusedRouteNameFromRoute,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
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

  const habitId = Array.isArray(habitContextId)
    ? habitContextId[0]
    : habitContextId;
  const habitInput = Array.isArray(habitContextInput)
    ? habitContextInput[0]
    : habitContextInput;
  console.log("HabitId: ", habitId);
  console.log("Habit Input: ", habitInput);

  const [feedbackData, setFeedbackData] = useState([]);
  const [teammemberData, setTeammemberData] = useState([]);

  const fetchFeedbackData = async () => {
    console.log("I'm here to fetch feedback request data...");
    try {
      if (!token) {
        console.warn("Authentication token is missing. Skipping API calls.");
        return;
      }

      const [feedbackResponse, teammemberResponse] = await Promise.all([
        fetch(`http://localhost:8000/feedback/${userNameContext}/${habitId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:8000/teammember/${userNameContext}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!feedbackResponse.ok)
        throw new Error("Failed to fetch feedback data.");

      const feedbackData = await feedbackResponse.json();
      console.log("Feedback Data: ", feedbackData);

      if (!Array.isArray(feedbackData.feedback)) {
        console.error("Unexpected API response format:", data);
        return;
      }

      setFeedbackData(feedbackData.feedback);

      if (!teammemberResponse.ok)
        throw new Error("Failed to fetch team member data.");

      const teammemberData = await teammemberResponse.json();
      console.log("TEam member Data: ", teammemberData);

      setTeammemberData(teammemberData.teamMembers);

      console.log("Feedback Data: ", feedbackData);
      console.log("Team Member Data: ", teammemberData);
    } catch (error) {
      console.error("Error with data retrieval:", error);
    }
  };

  useEffect(() => {
    if (userNameContext) {
      fetchFeedbackData();
    }
  }, [userNameContext]);
  getFocusedRouteNameFromRoute;

  useEffect(() => {
    console.log("Updated Feedback Data:", feedbackData);
    console.log("Updated Team Data:", teammemberData);
  }, [feedbackData, teammemberData]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>Feedback Data</Text>
        </View>

        <View style={styles.bodyIntroContainer}>
          <Text style={styles.bodyIntroText}>{firstNameContext}:</Text>
          <Text style={styles.bodyIntroText}>{habitInput}</Text>
          <Text style={styles.bodyIntroText}>{descriptionContextInput}</Text>

          <View>
            <Text style={styles.bodyTitleText}>Team Members</Text>
            {teammemberData.length === 0 ? (
              <Text>No team members available.</Text>
            ) : (
              <FlatList
                data={teammemberData}
                keyExtractor={(item) =>
                  item.teamMemberId?.toString() || Math.random().toString()
                }
                renderItem={({ item }) => {
                  const teamMemberFeedback = feedbackData.filter(
                    (feedback) => feedback.teamMemberId === item.teamMemberId
                  );

                  return (
                    <View style={{ marginBottom: 20 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 10,
                        }}>
                        <Image
                          source={{ uri: item.teamMemberProfilePic }}
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            marginRight: 10,
                          }}
                        />
                        <Text>
                          {item.teamMemberFirstName} {item.teamMemberLastName}
                        </Text>
                      </View>

                      {teamMemberFeedback.length > 0 ? (
                        <View style={{ marginLeft: 60 }}>
                          {teamMemberFeedback.map((feedback) => (
                            <View
                              key={feedback._id}
                              style={{ marginBottom: 10 }}>
                              <Text style={styles.bold}>
                                {new Date(
                                  feedback.feedbackDate
                                ).toLocaleDateString()}
                              </Text>
                              <Text>Rating: {feedback.feedbackRating}</Text>
                              <Text>
                                Thanks Rating: {feedback.feedbackThanksRating}
                              </Text>
                              <Text>Comment: {feedback.feedbackText}</Text>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text style={{ marginLeft: 60, fontStyle: "italic" }}>
                          No feedback yet.
                        </Text>
                      )}
                    </View>
                  );
                }}
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
  bold: {
    fontFamily: "bold",
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
