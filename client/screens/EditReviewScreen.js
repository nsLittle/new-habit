import { useContext, useEffect, useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import DefaultProfiler from "../component/DefaultProfiler";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";

export default function EditReviewScreen() {
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
    lastFeedbackRequestDateContext,
  } = userContext || {};

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

  const [isLoading, setIsLoading] = useState(true);
  const [habitContextInputState, setHabitContextInputState] = useState(
    habitContextInput || ""
  );
  const [descriptionContextInputState, setDescriptionContextInputState] =
    useState(descriptionContextInput || "");

  useEffect(() => {
    const retrieveProfile = async () => {
      if (!token) return;

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
          showDialog(errorData.error || "We can't find you.");
          return;
        }

        const data = await response.json();
        setUserData(data);
        setProfileData(data);
      } catch (error) {
        showDialog("An error occurred while retrieving your data.");
        console.error("Data Retrieval Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    retrieveProfile();
  }, []);

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
          return;
        }

        const data = await response.json();
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
      console.log("UserData: ", userData);
      console.log("Habit Data: ", habitData);
      console.log("TEam member Data: ", teamMemberData);

      const incompleteHabits = habitData.habits.filter(
        (habit) => !habit.completed
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
        return newContext;
      });
    } catch (error) {
      console.error("Error with data retrieval:", error);
    }
  };

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

  if (isLoading) {
    return (
      <View style={styles.body}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>Edit Review</Text>
        </View>

        <View style={styles.reviewBox}>
          <View style={styles.teamMemberDataBox}>
            <Text style={styles.sectionTitle}>Your Habit:</Text>
            {Array.isArray(profileData.habits) &&
            profileData.habits.length > 0 ? (
              <View style={styles.contactPersonNameColumn}>
                <TextInput
                  style={styles.inputField}
                  value={habitContextInputState}
                  onChangeText={setHabitContextInputState}
                  placeholder="Enter your habit"
                />
                <Text style={[styles.sectionTitle]}>What that looks like:</Text>
                <TextInput
                  style={styles.inputField}
                  value={descriptionContextInputState}
                  onChangeText={setDescriptionContextInputState}
                  placeholder="Enter your description"
                />
              </View>
            ) : (
              <Text style={styles.noProfileData}>No habits available.</Text>
            )}
          </View>

          <View style={styles.teamMemberDataBox}>
            <Text style={styles.sectionTitle}>Your Feedback Cadence:</Text>
            {Array.isArray(habits) && habits.length > 0 ? (
              habits.map((habit) => (
                <Text key={habit._id} style={styles.centeredData}>
                  {habit.cadence || "No Feedback Cadence Available"}
                </Text>
              ))
            ) : (
              <Text style={styles.noProfileData}>
                No feedback cadence available.
              </Text>
            )}
          </View>

          <View style={styles.teamMemberDataBox}>
            <Text style={styles.sectionTitle}>Your Reminder Cadence:</Text>
            {Array.isArray(habits) && habits.length > 0 ? (
              habits.map((habit) => (
                <Text key={habit._id} style={styles.centeredData}>
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
              ))
            ) : (
              <Text style={styles.noProfileData}>
                No reminder schedule available.
              </Text>
            )}
          </View>

          <View style={styles.teamMemberDataBox}>
            <Text style={styles.sectionTitle}>Your Feedback Team Members:</Text>
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
    marginVertical: 10,
  },
  centeredData: {
    textAlign: "center",
    fontSize: 16,
    marginBotton: 5,
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    marginVertical: 8,
  },
  habitBox: {
    borderColor: "#D3D3D3",
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  teamMemberDataBox: {
    borderColor: "#D3D3D3",
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  reviewHabit: {
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
  profileData: {
    textAlign: "center",
    alignSelf: "center",
    fontSize: 16,
  },
  noProfileData: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  contactPersonNameColumn: {
    flexDirection: "column",
    alignItem: "center",
    justifyContent: "center",
  },
  contactName: {
    fontSize: 16,
    alignItems: "right",
    alignItem: "center",
    justifyContent: "center",
    textAlign: "center",
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
