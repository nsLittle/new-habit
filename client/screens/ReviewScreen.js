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

  const [userData, setUserData] = useState("");

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
        const response = await fetch(
          `https://new-habit-69tm.onrender.com/user/${userNameContext}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
          fetch(`https://new-habit-69tm.onrender.com/user/${userNameContext}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(
            `https://new-habit-69tm.onrender.com/habit/${userNameContext}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(
            `https://new-habit-69tm.onrender.com/teammember/${userNameContext}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

      if (!userResponse.ok) throw new Error("Failed to fetch user data.");
      if (!habitsResponse.ok) throw new Error("Failed to fetch habit data.");
      if (!teamMemberResponse.ok)
        throw new Error("Failed to fetch team member data.");

      const userData = await userResponse.json();
      const habitData = await habitsResponse.json();
      const teamMemberData = await teamMemberResponse.json();

      console.log("User Data: ", userData);

      const user =
        Array.isArray(userData) && userData.length > 0 ? userData[0] : {};

      const habitsArray = Array.isArray(habitData.habits)
        ? habitData.habits
        : [];

      const teamMembersArray = Array.isArray(teamMemberData.teamMembers)
        ? teamMemberData.teamMembers
        : [];

      console.log("Habit Data: ", habitData);
      console.log(
        "Habit Data - Description Input: ",
        habitData.habits[0].description
      );
      console.log("Team Member Data: ", teamMemberData);

      setProfileData({
        firstname: user.firstName || "",
        lastName: user.lastName || "",
        profilePic: user.profilePic || "",
        email: user.email || "",
        habits: habitsArray,
        teammembers: teamMembersArray,
      });

      console.log("Updated Profile Data:", {
        firstname: user.firstName || "",
        lastName: user.lastName || "",
        profilePic: user.profilePic || "",
        email: user.email || "",
        habits: habitsArray,
        teammembers: teamMembersArray,
      });

      setUserContext((prev) => {
        const newContext = {
          ...prev,
          firstNameContext: user.firstName || "",
          lastNameContext: user.lastName || "",
          profilePicContext: user.profilePic || "",
          emailContext: user.email || "",
          habitsContext: habitsArray,
          descriptionContextInput: habitData.habits[0].description,
          teamMembersContext: teamMembersArray,
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

  const { firstname, lastName, profilePic, email, habits, teammembers } =
    profileData;

  console.log("Profile Data: ", profileData);
  console.log("Habits: ", habits);

  console.log("ProfilePic: ", profileData.profilePic);

  const profilePicUrl = isValidUrl(profilePic)
    ? profilePic
    : profilePic
    ? `https://new-habit-69tm.onrender.com/data/${profilePic.trim()}`
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
            {Array.isArray(habits) && habits.length > 0 ? (
              habits.map((habit) => (
                <View key={habit._id} style={styles.sectionTitle}>
                  <View style={styles.habitBox}>
                    <Text style={styles.sectionTitle}>Your Habit:</Text>
                    <Text style={styles.habitData}>
                      {habit.habit || "No Habit Available"}
                    </Text>
                    <Text style={styles.sectionTitle}>
                      What that looks like:
                    </Text>
                    <Text style={styles.habitData}>
                      {habit.description || "No Description Available"}
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
              <Text style={styles.noProfileData}>No habits available.</Text>
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
              <Text style={styles.noProfileData}>No habits available.</Text>
            )}
          </View>

          <View style={styles.teamMemberDataBox}>
            <Text style={styles.sectionTitle}>Your feedback circle:</Text>

            {Array.isArray(teammembers) && teammembers.length > 0 ? (
              teammembers.map((teammember) => (
                <View
                  key={teammember.teamMemberId}
                  style={styles.teamMemberContainer}>
                  <TouchableOpacity style={styles.contactPersonButton}>
                    {teammember.teamMemberProfilePic ? (
                      <Image
                        source={{ uri: teammember.teamMemberProfilePic }}
                        style={styles.teamMemberProfilePic}
                        onError={(error) =>
                          console.error("Image Load Error:", error?.nativeEvent)
                        }
                      />
                    ) : (
                      <Text style={styles.profileData}>
                        No profile picture available.
                      </Text>
                    )}
                    <View style={styles.contactPersonNameColumn}>
                      <Text style={styles.contactName}>
                        {teammember.teamMemberFirstName || "No First Name"}{" "}
                        {teammember.teamMemberLastName || "No Last Name"}
                      </Text>
                      <Text style={styles.contactEmail}>
                        {teammember.teamMemberEmail || "No Email"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noProfileData}>
                No team members available.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate("FeedbackRequestScreen")}>
            <Text style={styles.startButtonText}>Start Habit Formation ▶</Text>
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
    borderWidth: 5,
    borderColor: "#FFD700",
    width: 40,
    height: 40,
    marginBottom: 15,
    borderRadius: 50,
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
    borderWidth: 0.5,
    borderColor: "#FFD700",
    width: 15,
    height: 15,
    marginTop: 3,
    marginBottom: 3,
    marginLeft: 100,
    borderRadius: 50,
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
    alignItem: "left",
    justifyContent: "left",
  },
  contactEmail: {
    fontSize: 16,
    alignItems: "right",
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
    fontWeight: "bold",
  },
  // backButton: {
  //   backgroundColor: "#D3D3D3",
  //   borderRadius: 25,
  //   paddingVertical: 15,
  //   paddingHorizontal: 20,
  //   alignItems: "center",
  //   width: 150,
  //   height: 45,
  //   justifyContent: "center",
  // },
  // backButtonText: {
  //   color: "black",
  //   fontSize: 12,
  //   textAlign: "center",
  //   fontWeight: "bold",
  // },
});
