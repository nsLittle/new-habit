import { useContext, useEffect, useState } from "react";
import {
  Image,
  Linking,
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
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";

export default function ProfileScreen() {
  const navigation = useNavigation();

  const routes = navigation.getState().routes;
  const currentRoute = routes[routes.length - 1]?.name;
  // console.log("Current Route:", currentRoute);

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
    habitContextEndDate,
    teamMemberContextId,
    token,
  } = userContext || {};

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const fetchUserData = async () => {
    try {
      if (!token) {
        console.warn("Authentication token is missing. Skipping API calls.");
        return;
      }

      const [userResponse, habitsResponse, teamMemberResponse] =
        await Promise.all([
          fetch(`${BASE_URL}/user/${userNameContext}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),

          fetch(`${BASE_URL}/habit/${userNameContext}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/teammember/${userNameContext}`, {
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

      // console.log("User Data: ", userData);
      // console.log("User Data - Username: ", userData[0]?.username);
      // console.log("User Data - First Name: ", userData[0]?.firstName);
      // console.log("Habit Data: ", habitData);
      // console.log("Habit Data - Habit: ", habitData.habits[0]?.habit);
      // console.log(
      //   "Habit Data - Description: ",
      //   habitData.habits[0]?.description
      // );
      // console.log("Habit Data - Habit Id: ", habitData.habits[0]?._id);
      // console.log("Habit End Dte: ", habitData.habits[0]?.endDate);
      // console.log("Team Member Data: ", teamMemberData);

      const incompleteHabits = habitData.habits.filter(
        (habit) => !habit.completed
      );

      setUserContext((prev) => ({
        ...prev,
        userNameContext: userData[0].username,
        userIdContext: userData[0]._id,
        firstNameContext: userData[0].firstName,
        lastNameContext: userData[0].lastName,
        emailContext: userData[0].email,
        profilePicContext: userData[0].profilePic,
        habitContextInput: habitData.habits[0]?.habit,
        descriptionContextInput: habitData.habits[0]?.description,
        habitContextId: habitData.habits[0]?._id,
        habitContextEndDate: habitData.habits[0]?.endDate,
        teammembers: teamMemberData.teamMembers || [],
      }));
    } catch (error) {
      console.error("Error with data retrieval:", error);
    }
  };

  useEffect(() => {
    if (userNameContext) {
      fetchUserData();
      // console.log(userNameContext);
    }
  }, []);

  const profilePicUrl = isValidUrl(profilePicContext)
    ? profilePicContext
    : profilePicContext
    ? `${BASE_URL}/data/${profilePicContext.trim()}`
    : "default-image-url-here";

  const testImage =
    "https://media.wired.com/photos/5cdefc28b2569892c06b2ae4/master/w_2560%2Cc_limit/Culture-Grumpy-Cat-487386121-2.jpg";

  const sendEmail = (emailContext) => {
    if (email) {
      const mailtoURL = `mailto:${email}`;
      Linking.openURL(mailtoURL).catch((err) =>
        console.error("Failed to open email client", err)
      );
      setDialogMessage("Failed to open email client.");
      setShowDialog(true);
    } else {
      console.error("No email address provided");
      setDialogMessage("No email address provided");
      setShowDialog(true);
    }
  };

  useEffect(() => {
    if (currentRoute !== "ProfileScreen") return;

    const checkData = async () => {
      if (!habitContextId || !userNameContext || !token) return;

      try {
        const feedbackResponse = await fetch(
          `${BASE_URL}/feedback/${userNameContext}/${habitContextId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const feedbacks = await feedbackResponse.json();

        if (feedbacks.feedback && feedbacks.feedback.length > 0) {
          navigation.navigate("FeedbackDataScreen");
        } else {
          navigation.navigate("ReviewScreen");
        }
      } catch (error) {
        console.error("Error during login check:", error);
      }
    };

    checkData();
  }, [userContext, currentRoute]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.body}>
        <View style={styles.profileDataBox}>
          {profilePicContext ? (
            <Image
              source={{ uri: profilePicContext }}
              style={styles.profilePicMain}
            />
          ) : null}

          <Text style={styles.bodyTitleTextSub}>{userNameContext}</Text>

          <View style={styles.profileDetails}>
            <View style={styles.profileMain}>
              <Text style={styles.profileData}>
                {firstNameContext} {lastNameContext}
              </Text>
              <Text style={styles.profileData}>{emailContext}</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => navigation.navigate("ReviewScreen")}>
            <Text style={styles.saveButtonText}>Review Habit Settings</Text>
          </TouchableOpacity>
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
  bodyTitleTextSub: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },
  profileDataBox: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
  profileDetails: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileMain: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  profileData: {
    textAlign: "center",
    alignSelf: "center",
    fontSize: 16,
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
  saveButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 300,
    height: 45,
    justifyContent: "center",
  },
  saveButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
  },
});
