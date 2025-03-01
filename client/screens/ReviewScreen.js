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

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    username,
    userId,
    habitId,
    habitinput,
    teammemberId,
    firstName,
    token,
  } = userContext || {};
  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("User Name: ", username);
      console.log("User Id: ", userId);
      console.log("Habit Input: ", habitinput);
      console.log("Habit Id: ", habitId);
      console.log("Teammember Id: ", teammemberId);
      console.log("First Name: ", firstName);
      console.log("Token: ", token);
    }
  }, [userContext]);

  useEffect(() => {
    const retrieveProfile = async () => {
      if (!token) {
        console.error("No token available, authentication required.");
        return;
      }

      console.log("Sending Request with Token:", token);

      try {
        const response = await fetch(
          `http://192.168.1.174:8000/user/${username}`,
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
          fetch(`http://192.168.1.174:8000/user/${username}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://192.168.1.174:8000/habit/${username}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://192.168.1.174:8000/teammember/${username}`, {
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
      console.log("Habit Data: ", habitData);
      console.log("Team Member Data: ", teamMemberData);

      setProfileData((prev) => ({
        ...prev,
        firstname: userData?.firstName || "",
        lastName: userData?.lastName || "",
        profilePic: userData?.profilePic || "",
        email: userData?.email || "",
        habits: habitData?.habits || [],
        teammembers: [...teamMemberData?.teamMembers] || [],
      }));

      console.log("Profile Data: ", profileData);
      console.log("User First Name; ", profileData.firstname);
      console.log("Teammembers: ", profileData.teammembers);
    } catch (error) {
      console.error("Error with data retrieval:", error);
    }
  };

  useEffect(() => {
    if (username) {
      fetchUserData();
    }
  }, [username]);

  const { firstname, lastName, profilePic, email, habits, teammembers } =
    profileData;

  console.log("Profile Data: ", profileData);
  console.log("Habits: ", habits);

  console.log("ProfilePic: ", profilePic);

  const profilePicUrl = isValidUrl(profilePic)
    ? profilePic
    : profilePic
    ? `http://192.168.1.174:8000/data/${profilePic.trim()}`
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
            {habits.length > 0 ? (
              habits.map((habit) => (
                <View key={habit._id} style={styles.sectionTitle}>
                  <View style={styles.habitBox}>
                    <Text style={styles.habitData}>
                      {habit.habit || "Unnamed Habit"}
                    </Text>
                    <Text style={styles.bold}>
                      If you were doing this well, what would that look like?
                    </Text>
                    <Text style={styles.habitData}>
                      {habit.description || "Unnamed Habit Description"}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noProfileData}>No habits available.</Text>
            )}
          </View>

          <View style={styles.reviewCadence}>
            {habits.length > 0 ? (
              habits.map((habit) => (
                <View key={habit._id} style={styles.habitBox}>
                  <Text style={styles.sectionTitle}>
                    Your Feedback Cadence:
                  </Text>
                  <Text style={styles.habitData}>
                    {habit.cadence || "Unnamed Feedback Cadence"}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noProfileData}>No habits available.</Text>
            )}
          </View>

          <View style={styles.reviewReminders}>
            {habits.length > 0 ? (
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
                          habit.reminders.selectedDays.length > 0
                            ? habit.reminders.selectedDays.join(", ")
                            : "No days selected"
                        } at ${habit.reminders.selectedTime.hour}:${String(
                          habit.reminders.selectedTime.minute
                        ).padStart(2, "0")} ${
                          habit.reminders.selectedTime.period
                        }.`
                      : "Unnamed Reminder Cadence"}
                  </Text>
                  {/* <Text style={styles.habitData}>
                    {habit.reminders
                      ? `Reminder Enabled: ${
                          habit.reminders.isReminderEnabled ? "Yes" : "No"
                        }\n` +
                        `Email Reminder: ${
                          habit.reminders.isEmailReminderEnabled ? "Yes" : "No"
                        }\n` +
                        `Text Reminder: ${
                          habit.reminders.isTextReminderEnabled ? "Yes" : "No"
                        }\n` +
                        `Time: ${habit.reminders.selectedTime.hour}:${habit.reminders.selectedTime.minute}\n` +
                        `Days: ${
                          habit.reminders.selectedDays.length > 0
                            ? habit.reminders.selectedDays.join(", ")
                            : "No days selected"
                        }\n` +
                        `Period: ${habit.reminders.selectedTime.period}\n`
                      : "Unnamed Reminder Cadence"}
                  </Text> */}
                </View>
              ))
            ) : (
              <Text style={styles.noProfileData}>No habits available.</Text>
            )}
          </View>

          <View style={styles.reviewTeams}>
            <View style={styles.teamMemberDataBox}>
              <Text style={styles.sectionTitle}>Your feedback circle:</Text>

              {teammembers.map((teammember) => (
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
                        {teammember.teamMemberFirstName}{" "}
                        {teammember.teamMemberLastName}
                      </Text>
                      <Text style={styles.contactEmail}>
                        {teammember.teamMemberEmail}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("LogoutScreen")}>
            <Text style={styles.backButtonText}>◀ Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => navigation.navigate("FeedbackRequestScreen")}>
            <Text style={styles.saveButtonText}>START ▶</Text>
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
  reviewHabit: {
    borderColor: "#D3D3D3",
    borderWidth: 1,
    paddingVertical: 10,
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
  saveButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 150,
    height: 45,
    justifyContent: "center",
  },
  saveButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 150,
    height: 45,
    justifyContent: "center",
  },
  backButtonText: {
    color: "black",
    fontSize: 12,
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
});
