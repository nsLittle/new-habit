import { useContext, useEffect, useState } from "react";
import {
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
import DefaultProfiler from "../component/DefaultProfiler";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";

export default function ReviewScreen() {
  const navigation = useNavigation();
  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    userNameContext,
    habitContextId,
    habitContextInput,
    descriptionContextInput,
    token,
    lastFeedbackRequestDateContext,
  } = userContext || {};

  const [profileData, setProfileData] = useState({
    habits: [],
    teammembers: [],
    feedback: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      if (!token) throw new Error("Authentication token is missing.");

      const [
        userResponse,
        habitsResponse,
        teamMemberResponse,
        feedbackResponse,
      ] = await Promise.all([
        fetch(`${BASE_URL}/user/${userNameContext}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/habit/${userNameContext}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/teammember/${userNameContext}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/feedback/${userNameContext}/${habitContextId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      console.log("user:", userResponse.status);
      console.log("habits:", habitsResponse.status);
      console.log("teamMembers:", teamMemberResponse.status);
      console.log("feedback:", feedbackResponse.status);

      if (
        !userResponse.ok ||
        !habitsResponse.ok ||
        !teamMemberResponse.ok ||
        !feedbackResponse.ok
      ) {
        throw new Error("One or more requests failed.");
      }

      const userData = await userResponse.json();
      const habitData = await habitsResponse.json();
      const teamMemberData = await teamMemberResponse.json();
      const feedbackData = await feedbackResponse.json();

      console.log("TEAM MEMBER DATA: ", teamMemberData);

      const incompleteHabits = habitData.habits.filter(
        (habit) => !habit.completed
      );

      setProfileData({
        habits: incompleteHabits,
        teammembers: Array.isArray(teamMemberData.teamMembers)
          ? teamMemberData.teamMembers
          : [],
        feedback: Array.isArray(feedbackData) ? feedbackData : [],
      });

      setUserContext((prev) => ({
        ...prev,
        userNameContext: userData[0].username,
        userIdContext: userData[0]._id,
        firstNameContext: userData[0].firstName,
        lastNameContext: userData[0].lastName,
        emailContext: userData[0].email,
        profilePicContext: userData[0].profilePic,
        habitContextInput: incompleteHabits[0]?.habit,
        descriptionContextInput: incompleteHabits[0]?.description,
        habitContextId: incompleteHabits[0]?._id,
        habitContextEndDate: incompleteHabits[0]?.endDate,
        teammembers: teamMemberData.teamMembers || [],
      }));
    } catch (error) {
      console.error("Error with data retrieval:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userNameContext) {
      fetchUserData();
    }
  }, [userNameContext]);

  const { habits, teammembers, feedback } = profileData;
  const hasTeamMembers = teammembers.length > 0;
  const hasFeedback = feedback.some((fb) => fb.habitId === habitContextId);

  if (isLoading) {
    return (
      <View style={styles.body}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "white" }}
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        <View style={styles.body}>
          <Text style={styles.bodyTitleText}>Review</Text>

          <View style={styles.teamMemberDataBox}>
            <Text style={styles.sectionTitle}>Your Habit:</Text>
            {Array.isArray(habits) && habits.length > 0 ? (
              <View>
                <Text style={styles.centeredData}>
                  {habitContextInput || "No Habit Available"}
                </Text>
                <Text style={styles.sectionTitle}>What that looks like:</Text>
                <Text style={styles.centeredData}>
                  {descriptionContextInput || "No Description Available"}
                </Text>
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
            {teammembers && teammembers.length > 0 ? (
              teammembers.map((teammember) => (
                <View
                  key={teammember.teamMemberId}
                  style={styles.teamMemberProfileBox}>
                  <DefaultProfiler
                    uri={teammember.teamMemberProfilePic}
                    style={styles.teamMemberProfilePic}
                  />
                  <Text style={styles.contactName}>
                    {teammember.teamMemberFirstName || "No First Name"}{" "}
                    {teammember.teamMemberLastName || "No Last Name"}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noProfileData}>
                No team members available.
              </Text>
            )}
          </View>

          <View style={styles.buttonColumn}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.navigate("EditReviewScreen")}>
              <Text style={styles.startButtonText}>
                Edit Your Habit Setting
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => navigation.navigate("TeamInviteScreen")}>
              <Text style={styles.viewButtonText}>
                Invite/Edit Team Members
              </Text>
            </TouchableOpacity>

            {hasTeamMembers && (
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => navigation.navigate("FeedbackRequestScreen")}>
                <Text style={styles.viewButtonText}>Request Feedback</Text>
              </TouchableOpacity>
            )}

            {hasFeedback && (
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => navigation.navigate("FeedbackDataScreen")}>
                <Text style={styles.viewButtonText}>Review Feedback</Text>
              </TouchableOpacity>
            )}
          </View>

          {lastFeedbackRequestDateContext && (
            <Text style={styles.sectionTitle}>
              Last feedback request sent:{" "}
              {new Date(lastFeedbackRequestDateContext).toLocaleDateString()}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
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
    paddingTop: 30,
    paddingBottom: 30,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
    marginVertical: 10,
  },
  reviewBox: {
    borderColor: "#D3D3D3",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: "85%",
  },
  teamMemberProfilePic: {
    borderWidth: 5,
    borderColor: "#FFD700",
    width: 40,
    height: 40,
    marginBottom: 15,
    borderRadius: 30,
  },
  centeredData: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 5,
  },
  teamMemberProfileBox: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  teamMemberDataBox: {
    justifyContent: "center",
    alignContent: "center",
    borderColor: "#D3D3D3",
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: "100%",
    borderRadius: 10,
    backgroundColor: "#F9F9F9",
  },
  noProfileData: {
    textAlign: "center",
    color: "gray",
  },
  contactPersonNameColumn: {
    flexDirection: "column",
    justifyContent: "center",
  },
  contactName: {
    fontSize: 16,
    textAlign: "center",
  },
  contactEmail: {
    fontSize: 16,
    textAlign: "center",
  },
  buttonColumn: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    gap: 15,
    marginTop: 30,
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
