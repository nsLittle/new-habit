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
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import DefaultProfiler from "../component/DefaultProfiler";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";

export default function ReviewScreen() {
  const navigation = useNavigation();

  const routes = navigation.getState().routes;
  const currentRoute = routes[routes.length - 1]?.name;
  console.log("Current Route:", currentRoute);

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
    lastFeedbackRequestDateContext,
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
      console.log(
        "Last Feedback Reqeuest Date:",
        lastFeedbackRequestDateContext
      );
    }
  }, [userContext]);

  const [userData, setUserData] = useState("");

  const [validImage, setValidImage] = useState(true);

  const [profileData, setProfileData] = useState({
    firstname: "",
    lastName: "",
    profilePic: "",
    email: "",
    habits: [],
    teammembers: [],
  });

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const showDialog = (message) => {
    setDialogMessage(message);
    setDialogVisible(true);
  };

  useEffect(() => {
    const retrieveProfile = async () => {
      if (!token) {
        console.error("No token available, authentication required.");
        return;
      }

      console.log("Sending Request with Token:", token);

      try {
        const response = await fetch(`${BASE_URL}/user/${userNameContext}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setDialogMessage(errorData.error || "We can't find you.");
          setDialogVisible(true);
          console.log(`We can't find you.`);
          return;
        }

        const data = await response.json();
        console.log("Retrieved Data:", data);
        setUserData(data);
        setProfileData(data);
      } catch (error) {
        setDialogMessage("An error occurred while retrieving your data.");
        setDialogVisible(true);
        console.error("Data Retrieval Error:", error);
      }
    };
    retrieveProfile();
  }, []);

  const fetchUserData = async () => {
    try {
      if (!token) throw new Error("Authentication token is missing.");

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
          fetch(`${BASE_URL}/feedback/${userNameContext}`, {
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
      console.log("Habit Data:", habitData);
      console.log("Team Memeber Data: ", teamMemberData);
      // console.log("✅ END DATE: ", habitData.habits[0].endDate);

      const incompleteHabits = habitData.habits.filter(
        (habit) => !habit.completed
      );

      console.log("🟡 Incomplete Habits:", incompleteHabits);
      console.log("Incomplete Cadence: ", incompleteHabits[0].cadence);
      console.log(
        "Incomplete Reminders Day: ",
        incompleteHabits[0].reminders.selectedDays
      );
      console.log(
        "Incomplete Reminders: ",
        incompleteHabits[0].reminders.selectedTime
      );

      setProfileData({
        username: userData[0].username,
        userId: userData[0]._id,
        firstName: userData[0].firstName,
        lastName: userData[0].lastName,
        email: userData[0].email,
        profilePic: userData[0].profilePic,
        habits: incompleteHabits,
        teammembers: Array.isArray(teamMemberData.teamMembers)
          ? teamMemberData.teamMembers
          : [],
      });

      console.log("Updated Profile Data:", {
        firstname: userData[0]?.firstName || "",
        lastName: userData[0]?.lastName || "",
        profilePic: userData[0]?.profilePic || "",
        email: userData[0]?.email || "",
        habits: incompleteHabits,
        habitsId: incompleteHabits[0]._id,
        habitsInput: incompleteHabits[0].habit,
        habitsDescription: incompleteHabits[0].description,
        teammembers: teamMemberData.teamMembers || [],
      });

      setUserContext((prev) => {
        const newContext = {
          ...prev,
          userNameContext: userData[0].username,
          userIdContext: userData[0]._id,
          firstNameContext: userData[0].firstName,
          lastNameContext: userData[0].lastName,
          emailContext: userData[0].email,
          profilePicContext: userData[0].profilePic,

          habitContextInput: incompleteHabits[0].habit,
          descriptionContextInput: incompleteHabits[0].description,
          habitContextId: incompleteHabits[0]._id,
          habitContextEndDate: incompleteHabits[0].endDate,
          teammembers: teamMemberData.teamMembers || [],
        };
        console.log("Updated UserContext:", newContext);
        return newContext;
      });
    } catch (error) {
      console.error("Error with data retrieval:", error);
    }
  };

  useEffect(() => {
    console.log("UserContext Updated:", userContext);
  }, [userContext]);

  useEffect(() => {
    console.log("Profile Data Updated:", profileData);
  }, [profileData]);

  useEffect(() => {
    if (userNameContext) {
      fetchUserData();
    }
  }, [userNameContext]);

  const {
    firstname,
    lastName,
    username,
    userId,
    profilePic,
    email,
    habits,
    teammembers,
  } = profileData;

  console.log("ProfilePic: ", profileData.profilePicContext);

  const profilePicUrl = isValidUrl(profilePic)
    ? profilePic
    : profilePic
    ? `${BASE_URL}/data/${profilePic.trim()}`
    : "default-image-url-here";

  const testImage =
    "https://media.wired.com/photos/5cdefc28b2569892c06b2ae4/master/w_2560%2Cc_limit/Culture-Grumpy-Cat-487386121-2.jpg";

  const sendEmail = (email) => {
    if (email) {
      const mailtoURL = `mailto:${email}`;
      Linking.openURL(mailtoURL).catch((err) =>
        console.error("Failed to open email client", err)
      );
      setDialogMessage("Failed to open email client.");
      setDialogVisible(true);
    } else {
      console.error("No email address provided");
      setDialogMessage("No email address provided");
      setDialogVisible(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>Review and Start</Text>
        </View>

        <View style={styles.reviewBox}>
          <View style={styles.reviewHabit}>
            {Array.isArray(profileData.habits) &&
            profileData.habits.length > 0 ? (
              profileData.habits.map((habit) => (
                <View key={habit._id} style={styles.sectionTitle}>
                  <View style={styles.habitBox}>
                    <Text style={styles.sectionTitle}>Your Habit:</Text>
                    <Text style={styles.habitData}>
                      {habitContextInput || "No Habit Available"}
                    </Text>
                    <Text style={styles.sectionTitle}>
                      What that looks like:
                    </Text>
                    <Text style={styles.habitData}>
                      {descriptionContextInput || "No Description Available"}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noProfileData}>No habits available.</Text>
            )}
          </View>

          <View style={styles.reviewCadence}>
            {Array.isArray(habits) && habits.length > 0 ? (
              habits.map((habit) => (
                <View key={habit._id} style={styles.habitBox}>
                  <Text style={styles.sectionTitle}>
                    Your Feedback Cadence:
                  </Text>
                  <Text style={styles.habitData}>
                    {habit.cadence || "No Feedback Cadence Available"}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noProfileData}>
                No feedback cadence available.
              </Text>
            )}
          </View>

          <View style={styles.reviewReminders}>
            {Array.isArray(habits) && habits.length > 0 ? (
              habits.map((habit) => (
                <View key={habit._id} style={styles.habitBox}>
                  <Text style={styles.sectionTitle}>
                    Your Reminder Cadence:
                  </Text>
                  <Text style={styles.habitData}>
                    {habit.reminders && habit.reminders.isReminderEnabled
                      ? `You will receive a ${
                          habit.reminders.isTextReminderEnabled
                            ? "text reminder"
                            : habit.reminders.isEmailReminderEnabled
                            ? "email reminder"
                            : "reminder"
                        } on ${
                          Array.isArray(habit.reminders.selectedDays) &&
                          habit.reminders.selectedDays.length > 0
                            ? habit.reminders.selectedDays.join(", ")
                            : "No days selected"
                        } at ${
                          habit.reminders.selectedTime?.hour ?? "--"
                        }:${String(
                          habit.reminders.selectedTime?.minute ?? "00"
                        ).padStart(2, "0")} ${
                          habit.reminders.selectedTime?.period ?? "--"
                        }.`
                      : "No Reminder Cadence Available"}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noProfileData}>
                No reminder schedule available.
              </Text>
            )}
          </View>

          <View style={styles.teamMemberDataBox}>
            {/* <Text style={styles.sectionTitle}>Your feedback circle:</Text> */}

            {profileData.teammembers && profileData.teammembers.length > 0 ? (
              profileData.teammembers.map((teammember, index) => (
                <View
                  key={teammember.teamMemberId}
                  style={styles.contactPersonNameColumn}>
                  <TouchableOpacity style={styles.contactPersonButton}>
                    <DefaultProfiler
                      uri={teammember.teamMemberProfilePic}
                      style={styles.teamMemberProfilePic}
                    />
                    <Text style={styles.contactName}>
                      {teammember.teamMemberFirstName || "No First Name"}{" "}
                      {teammember.teamMemberLastName || "No Last Name"}
                    </Text>
                    <Text style={styles.contactEmail}>
                      {teammember.teamMemberEmail || "No Email"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noProfileData}>
                No team members available.
              </Text>
            )}
          </View>

          <View style={styles.reviewBox}>
            {lastFeedbackRequestDateContext && (
              <Text style={styles.sectionTitle}>
                Last feedback request sent:{" "}
                {new Date(
                  lastFeedbackRequestDateContext
                ).toLocaleDateString() || "Invalid Date"}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.buttonColumn}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate("CreateHabitScreen")}>
            <Text style={styles.startButtonText}>Create Your Habit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate("FeedbackRequestScreen")}>
            <Text style={styles.startButtonText}>Request Feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate("FeedbackDataScreen")}>
            <Text style={styles.viewButtonText}>Review Feedback</Text>
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
    overflow: "auto",
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
  bodyTitleTextSub: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  bold: {
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },
  teamMemberProfilePic: {
    width: 30,
    height: 30,
    marginBottom: 15,
    borderRadius: 50,
    color: "light gray",
  },
  reviewHabit: {
    borderColor: "#D3D3D3",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  teamMemberDataBox: {
    borderColor: "#D3D3D3",
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  reviewCadence: {
    borderColor: "#D3D3D3",
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  reviewReminders: {
    borderColor: "#D3D3D3",
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  reviewTeams: {
    borderColor: "#D3D3D3",
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  profileData: {
    textAlign: "center",
    alignSelf: "center",
    fontSize: 16,
  },
  teammemberProfilePicMain: {
    // borderWidth: 0.5,
    // borderColor: "#FFD700",
    width: 15,
    height: 15,
    marginTop: 3,
    marginBottom: 3,
    marginLeft: 100,
    borderRadius: 50,
  },
  noProfileData: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  habitBox: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  contactPersonButton: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 25,
    marginTop: 5,
    marginBottom: 5,
    width: 300,
    height: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactPersonNameColumn: {
    flexDirection: "row",
    alignItem: "center",
    justifyContent: "center",
  },
  contactEmail: {
    fontSize: 16,
    alignItems: "right",
  },
  buttonColumn: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    gap: 15,
    marginTop: 50,
  },
  startButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 300,
    height: 45,
    justifyContent: "center",
  },
  startButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
  },
  viewButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 300,
    height: 45,
    justifyContent: "center",
  },
  viewButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
  },
});
