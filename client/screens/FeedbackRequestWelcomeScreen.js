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

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    userName,
    userId,
    habitId,
    habitinput,
    teammemberId,
    teammemberFirstName,
    teammemberProfilePic,
    firstName,
    lastName,
    email,
    profilePic,
    token,
  } = userContext || {};

  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("Username: ", userName);
      console.log("User Id: ", userId);
      console.log("Habit Id: ", habitId);
      console.log("Habit Input: ", habitinput);
      console.log("Team Member Id: ", teammemberId);
      console.log("Team Member First Name: ", teammemberFirstName);
      console.log("Team member Profile Pic: ", teammemberProfilePic);
      console.log("First Name: ", firstName);
      console.log("Last Name: ", lastName);
      console.log("Email: ", email);
      console.log("Profile Pic: ", profilePic);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const route = useRoute();
  const {
    teamMemberId,
    teamMemberFirstName,
    teamMemberLastName,
    teamMemberEmail,
    teamMemberProfilePic,
  } = route.params || {};

  console.log("Received from FeedbackRequestScreen:", route.params);
  console.log("Team Member Id: ", teamMember_id);
  console.log("Team Member First Name: ", teamMemberFirstName);
  console.log("Team Member Last Name: ", teamMemberLastName);
  console.log("Team Memeber Email: ", teamMemberEmail);
  console.log("Team Member Profile Pic: ", teamMemberProfilePic);

  const fetchUserData = async () => {
    try {
      if (!token) {
        console.warn("Authentication token is missing. Skipping API calls.");
        return;
      }

      const [userResponse, habitsResponse, teamMemberResponse] =
        await Promise.all([
          fetch(`http://192.168.1.174:8000/user/${userName}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://192.168.1.174:8000/habit/${userName}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://192.168.1.174:8000/teammember/${userName}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      if (!userResponse.ok) throw new Error("Failed to fetch user data.");
      if (!habitsResponse.ok) throw new Error("Failed to fetch habit data.");
      if (!teamMemberResponse.ok)
        throw new Error("Failed to fetch team member data.");

      const userData = await userResponse.json();
      const habitData = await habitsResponse.json();
      const teamMemberData = await teamMemberResponse.json();

      console.log("User Data: ", userData);
      console.log("Profile Pic: ", userData?.profilePic);
      console.log("Habit Data: ", habitData);
      console.log("Habit Id: ", habitData?.habits[0]._id);
      console.log("Habit: ", habitData?.habits[0].habit);
      console.log("Reminders: ", habitData?.habits[0].description);
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
      }));
    } catch (error) {
      console.error("Error with data retrieval:", error);
    }
  };

  useEffect(() => {
    if (userName) {
      fetchUserData();
    }
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.body}>
        <View>
          <Image
            source={{ uri: profilePic }}
            style={styles.profileImage}
            onError={(error) =>
              console.error("Image Load Error:", error?.nativeEvent)
            }
          />
        </View>
        <View style={styles.bodyIntroContainer}>
          <Text style={styles.bodyTitleText}>Hi {teamMemberFirstName}</Text>
          <Text style={styles.bodyTitleText}>
            {firstName} is working to {habitinput}
          </Text>
          <Text>
            They are requesting your feedback. This will only take 2-3 minutes.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => {
                console.log("Navigating with params:", {
                  teamMember_id,
                  teamMemberFirstName,
                  teamMemberLastName,
                  teamMemberEmail,
                  teamMemberProfilePic,
                });

                navigation.navigate("FeedbackRequestRatingScreen", {
                  teamMember_id,
                  teamMemberFirstName,
                  teamMemberLastName,
                  teamMemberEmail,
                  teamMemberProfilePic,
                });
              }}>
              <Text style={styles.feedbackButtonText} title="Give Feedback">
                Give Feedback
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
  profileImage: {
    borderWidth: 5,
    borderColor: "#FFD700",
    width: 100,
    height: 100,
    marginBottom: 15,
    borderRadius: 50,
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
  feedbackButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 150,
    height: 45,
    justifyContent: "center",
  },
  feedbackButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
});
