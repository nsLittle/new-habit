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
  const { token, teammemberId } = route.params || {};
  console.log("Route Params: ", route.params);
  const teamMemberId = route.params.teamMemberId;
  console.log("TEam member ID: ", teamMemberId);

  const fetchUserData = async () => {
    try {
      if (!token || !teammemberId) {
        console.warn("Missing token or teammemberId — skipping fetch.");
        return;
      }

      const userResponse = await fetch(
        `${BASE_URL}/teammember/${teammemberId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!userResponse.ok) throw new Error("Failed to fetch user data.");
      const userData = await userResponse.json();
      const username = userData.username;

      const [
        habitsResponse,
        teamMembersResponse,
        feedbackResponse,
        teamMemberResponse,
      ] = await Promise.all([
        fetch(`${BASE_URL}/habit/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/teammember/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/feedback/${username}/${habitContextId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/teammember/${username}/${teammemberId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!habitsResponse.ok) throw new Error("Failed to fetch habit data.");
      if (!teamMembersResponse.ok)
        throw new Error("Failed to fetch team members.");
      if (!feedbackResponse.ok) throw new Error("Failed to fetch feedback.");
      if (!teamMemberResponse.ok)
        throw new Error("Failed to fetch team member details.");

      const habitData = await habitsResponse.json();
      const teamMembersData = await teamMembersResponse.json();
      const feedbackData = await feedbackResponse.json();
      const teamMemberData = await teamMemberResponse.json();

      setTeamMemberData(teamMemberData?.teamMember || teamMemberData);

      // ✅ Set minimal context based on fetched user info
      setUserContext((prev) => ({
        ...prev,
        username: userData.username,
        userId: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        profilePic: userData.profilePic,
        habits: habitData.habit || [],
        habitId: habitData?.habits[0]?._id,
        teammembers: teamMembersData.teamMembers || [],
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

    if (userNameContext && token && teamMemberId) {
      console.log("🟢 All required values present. Calling fetchUserData.");
      fetchUserData();
    } else {
      console.log("🔴 Missing data — skipping fetchUserData.");
    }
  }, [userNameContext, token, teammemberId]);

  console.log("TEam member id: ", teamMemberId, "Token: ", token);

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
