import { useContext, useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function FeedbackRequestWelcomeScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext, resetUserContext } =
    useContext(UserContext) || {};
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

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [teamMemberData, setTeamMemberData] = useState(null);

  const route = useRoute();

  console.log("Route Params: ", route.params);
  console.log(
    "Received from Email Deeplink (route.params):",
    route.params.teamMemberId
  );
  const token = route.params.token;
  const teammemberId = route.params.teamMemberId;
  console.log("Extracted Team Member ID:", teammemberId);
  console.log("Extracted Token:", token);

  const fetchUserData = async () => {
    try {
      if (!token) {
        console.warn("Authentication token is missing. Skipping API calls.");
        return;
      }

      const [
        userResponse,
        habitsResponse,
        teamMembersResponse,
        feedbackResponse,
        teamMemberResponse,
      ] = await Promise.all([
        fetch(`http://localhost:8000/user/${userNameContext}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:8000/habit/${userNameContext}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:8000/teammember/${userNameContext}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `http://localhost:8000/feedback/${userNameContext}/${habitContextId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(
          `http://localhost:8000/teammember/${userNameContext}/${teammemberId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      if (!userResponse.ok) throw new Error("Failed to fetch user data.");
      if (!habitsResponse.ok) throw new Error("Failed to fetch habit data.");
      if (!teamMembersResponse.ok)
        throw new Error("Failed to fetch team members data.");
      if (!feedbackResponse.ok)
        throw new Error("Failed to fetch feedback data.");
      if (!teamMemberResponse.ok)
        throw new Error("Failed to fetch team member data.");

      const userData = await userResponse.json();
      const habitData = await habitsResponse.json();
      const teamMembersData = await teamMembersResponse.json();
      const feedbackData = await feedbackResponse.json();
      const teamMemberData = await teamMemberResponse.json();

      setTeamMemberData(teamMemberData);

      console.log("User Data: ", userData);
      console.log("Profile Pic: ", userData[0].profilePic);
      console.log("Habit Data: ", habitData);
      console.log("Habit Id: ", habitData?.habits[0]._id);
      console.log("Habit: ", habitData?.habits[0].habit);
      console.log("Reminders: ", habitData?.habits[0].description);
      console.log("Team Members Data: ", teamMembersData);
      console.log("Feedback Data: ", feedbackData);
      console.log("Team Member Data: ", teamMemberData);

      setUserContext((prev) => ({
        ...prev,
        username: userData.username,
        userId: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        profilePic: userData.profilePic,
        habits: habitData.habit || [],
        habitId: habitData?.habits[0]._id,
        teammembers: teamMemberData.teamMembers || [],
        feedbacks: feedbackData.feedback || [],
      }));
    } catch (error) {
      console.error("Error with data retrieval:", error);
    }
  };

  useEffect(() => {
    if (userNameContext) {
      fetchUserData();
    }
  }, [userNameContext]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.body}>
        <View style={styles.bodyIntroContainer}>
          <View>
            <Image
              source={{ uri: profilePicContext }}
              style={styles.profileImage}
              onError={(error) =>
                console.error("Image Load Error:", error?.nativeEvent)
              }
            />
          </View>
          <Text style={styles.bodyTitleText}>
            {firstNameContext} says, "{habitContextInput}"
          </Text>
          <Text style={styles.bodySubText}>
            They are requesting your feedback on how well they are accomplishing
            this.
          </Text>
          <Text style={styles.bodySubText}>
            This will only take 2-3 minutes.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => {
                console.log("Navigating with teamMember Data:", teamMemberData); // Debug log
                navigation.navigate("FeedbackRequestRatingScreen", {
                  teamMemberData,
                  token,
                });
              }}>
              <Text style={styles.feedbackButtonText} title="Give Feedback">
                Give Feedback
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.noThanksButton}
              onPress={() => {
                console.log("Team member declines feedback request.");
                resetUserContext("NoThankYouScreen");
                navigation.navigate("NoThankYouScreen", {});
              }}>
              <Text style={styles.noThanksButtonText} title="No Thanks">
                No Thanks
              </Text>
            </TouchableOpacity>
          </View>
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
  bodySubText: {
    fontSize: 16,
    textAlign: "center",
  },
  bodyIntroContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  profileImage: {
    borderWidth: 5,
    borderColor: "#FFD700",
    width: 100,
    height: 100,
    marginBottom: 15,
    borderRadius: 50,
  },

  buttonRow: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    gap: 15,
    marginTop: 50,
  },
  feedbackButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 300,
    height: 45,
    justifyContent: "center",
  },
  feedbackButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
  },
  noThanksButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 150,
    height: 45,
    justifyContent: "center",
  },
  noThanksButtonText: {
    color: "black",
    fontSize: 12,
  },
});
