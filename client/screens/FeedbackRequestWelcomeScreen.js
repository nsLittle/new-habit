import * as Linking from "expo-linking";
import { useContext, useEffect, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
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

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [teamMemberData, setTeamMemberData] = useState(null);

  // const [deeplinkToken, setDeeplinkToken] = useState(null);
  // const [deeplinkTeammemberId, setDeeplinkTeammemberId] = useState(null);

  const route = useRoute();
  const { token, teamMemberId } = route.params || {};
  console.log("Route Params: ", route.params);
  console.log("TEam member ID: ", teamMemberId);

  const fetchUserData = async () => {
    try {
      if (!token || !teamMemberId) {
        console.warn("Missing token or teammemberId — skipping fetch.");
        return;
      }

      console.log(
        "Fetching:",
        `${BASE_URL}/teammember/${teamMemberId}/get-from-teammember`
      );

      const userResponse = await fetch(
        `${BASE_URL}/teammember/${teamMemberId}/get-from-teammember`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("userResponse status:", userResponse.status);

      if (!userResponse.ok) throw new Error("Failed to fetch user data.");
      const userData = await userResponse.json();
      console.log("User data: ", userData);
      console.log("User Username: ", userData.username);
      console.log("User First Name: ", userData.firstName);
      console.log("Profile Pic: ", userData.profilePic);
      const firstName = userData.firstName;
      const profilePic = userData.profilePic;
      console.log("Profile Pic: ", profilePic);
      const username = userData.username;

      const habitsResponse = await fetch(`${BASE_URL}/habit/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!habitsResponse.ok) throw new Error("Failed to fetch habit data.");
      const habitData = await habitsResponse.json();
      console.log("Habit Data: ", habitData);
      const habitId = habitData?.habits?.[0]?._id;
      console.log("Habit ID:", habitId);
      const habitInput = habitData?.habits?.[0]?.habit;
      console.log("Habit Input: ", habitInput);

      if (!habitId) throw new Error("No habit ID found.");

      const [feedbackResponse, teamMemberResponse] = await Promise.all([
        fetch(`${BASE_URL}/feedback/${username}/${habitId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/teammember/${username}/${teamMemberId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!feedbackResponse.ok) throw new Error("Failed to fetch feedback.");
      if (!teamMemberResponse.ok)
        throw new Error("Failed to fetch team member details.");

      const feedbackData = await feedbackResponse.json();
      const teamMemberData = await teamMemberResponse.json();

      setTeamMemberData(teamMemberData?.teamMember || teamMemberData);

      setUserContext((prev) => ({
        ...prev,
        userIdContext: userData._id,
        userNameContext: userData.username,
        firstNameContext: userData.firstName,
        lastNameContext: userData.lastName,
        emailContext: userData.email,
        profilePicContext: userData.profilePic,
        habitContextId: habitId,
        habitContextInput: habitInput,
        habits: habitData.habit || [],
        teammembers: teamMemberData.teamMembers || [],
        feedbacks: feedbackData.feedback || [],
      }));

      console.log("✅ Successfully hydrated context from token-based access.");
    } catch (error) {
      console.error("❌ Error with data retrieval:", error);
    }
  };

  useEffect(() => {
    console.log("🟡 useEffect triggered with:", {
      userNameContext,
      token,
      teamMemberId,
    });

    if (token && teamMemberId) {
      console.log("🟢 All required values present. Calling fetchUserData.");
      fetchUserData();
    } else {
      console.log("🔴 Missing data — skipping fetchUserData.");
    }
  }, [userNameContext, token, teamMemberId]);

  console.log("TEam member id: ", teamMemberId, "Token: ", token);
  console.log("📸 profilePicContext:", profilePicContext);

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
          <Text style={styles.bodyTitleText}>{firstNameContext} says,</Text>
          <Text style={styles.bodyTitleText}>"{habitContextInput}"</Text>
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
              disabled={!teamMemberData?._id}
              onPress={() => {
                if (!teamMemberData?._id) {
                  console.error("❌ No team member ID found. Cannot proceed.");
                  return;
                }

                console.log(
                  "✅ Navigating with teamMemberId:",
                  teamMemberData._id
                );

                navigation.navigate("FeedbackRequestRatingScreen", {
                  teammemberId: teamMemberData._id,
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
