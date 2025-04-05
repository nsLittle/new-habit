import { useContext, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import DefaultProfiler from "../component/DefaultProfiler";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

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

  const [showStartPrompt, setShowStartPrompt] = useState(false);

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
        ]);

      console.log("user:", userResponse);
      console.log("habits:", habitsResponse);
      console.log("teamMembers:", teamMemberResponse);

      if (!userResponse.ok || !habitsResponse.ok || !teamMemberResponse.ok) {
        throw new Error("One or more requests failed.");
      }

      const userData = await userResponse.json();
      const habitData = await habitsResponse.json();
      const teamMemberData = await teamMemberResponse.json();

      console.log("User Dadta: ", userData);
      console.log("Habit Data: ", habitData);
      console.log("Team member Data: ", teamMemberData);

      const incompleteHabits = habitData.habits.filter(
        (habit) => !habit.completed
      );

      if (incompleteHabits.length === 0) {
        setProfileData({
          habits: [],
          teammembers: Array.isArray(teamMemberData.teamMembers)
            ? teamMemberData.teamMembers
            : [],
          feedback: [],
        });
        setShowStartPrompt(true);
        setIsLoading(false);
        return;
      }

      const currentHabitId = incompleteHabits[0]?._id;

      const feedbackResponse = await fetch(
        `${BASE_URL}/feedback/${userNameContext}/${currentHabitId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!feedbackResponse.ok) {
        throw new Error("Feedback request failed.");
      }

      const feedbackData = await feedbackResponse.json();
      console.log("Feedback Data: ", feedbackData);

      setProfileData({
        habits: incompleteHabits,
        teammembers: Array.isArray(teamMemberData.teamMembers)
          ? teamMemberData.teamMembers
          : [],
        feedback: Array.isArray(feedbackData.feedback)
          ? feedbackData.feedback
          : [],
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

  const noHabit = !habitContextInput;

  useEffect(() => {
    if (userNameContext) {
      fetchUserData();
    }
  }, [userNameContext]);

  const { habits, teammembers, feedback } = profileData;
  const currentHabit = habits[0];
  const isHabitSettingsComplete =
    habitContextInput &&
    descriptionContextInput &&
    currentHabit?.cadence &&
    currentHabit?.reminders?.isReminderEnabled;
  const hasTeamMembers = teammembers.length > 0;
  const hasFeedback = feedback.some(
    (fb) => String(fb.habitId) === String(habitContextId)
  );

  console.log("Feedback Data: ", feedback);
  console.log("Has Feedback: ", hasFeedback);

  if (isLoading) {
    return (
      <View style={sharedStyles.body}>
        <Text>Loading...</Text>
      </View>
    );
  }

  console.log("currentHabit:", currentHabit);
  console.log("habitContextInput (from context):", habitContextInput);
  console.log("profileData.habits:", profileData.habits);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "white" }}
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        <View style={sharedStyles.body}>
          <Text style={[sharedStyles.title, { marginTop: 120 }]}>Review</Text>

          {showStartPrompt ? (
            <>
              <Text style={styles.completedMessage}>
                🎉 You’ve completed your last habit! Ready to start a new one?
              </Text>
              <TouchableOpacity
                style={sharedStyles.yellowButton}
                onPress={() => navigation.navigate("CreateHabitScreen")}>
                <Text style={sharedStyles.buttonText}>Start a New Habit</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.teamMemberDataBox}>
                <Text style={styles.sectionTitle}>Your Habit:</Text>
                {Array.isArray(habits) && habits.length > 0 ? (
                  <View>
                    <Text>{currentHabit?.habit || "No Habit Available"}</Text>
                    <Text style={styles.sectionTitle}>
                      What that looks like:
                    </Text>
                    <Text style={styles.centeredData}>
                      {currentHabit?.description || "No Description Available"}
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
                <Text style={styles.sectionTitle}>
                  Your Feedback Team Members:
                </Text>
                {teammembers && teammembers.length > 0 ? (
                  teammembers.map((teammember) => (
                    <View
                      key={teammember.teamMemberId}
                      style={styles.teamMemberProfileBox}>
                      <View style={styles.outerBorder}>
                        <View style={styles.innerBorder}>
                          <DefaultProfiler
                            uri={teammember.teamMemberProfilePic}
                            style={styles.teamMemberProfilePic}
                          />
                        </View>
                      </View>
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

              <View style={sharedStyles.buttonColumn}>
                <TouchableOpacity
                  style={
                    isHabitSettingsComplete
                      ? sharedStyles.greyButton
                      : sharedStyles.yellowButton
                  }
                  onPress={() => navigation.navigate("EditReviewScreen")}>
                  <Text style={sharedStyles.buttonText}>
                    Edit Your Habit Setting
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    teammembers.length < 3
                      ? sharedStyles.yellowButton
                      : sharedStyles.greyButton
                  }
                  onPress={() => navigation.navigate("TeamInviteScreen")}>
                  <Text style={sharedStyles.buttonText}>Edit Team Members</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    teammembers.length >= 3
                      ? sharedStyles.yellowButton
                      : sharedStyles.greyButton
                  }
                  onPress={() => navigation.navigate("FeedbackRequestScreen")}>
                  <Text style={sharedStyles.buttonText}>Request Feedback</Text>
                </TouchableOpacity>

                {hasFeedback && (
                  <TouchableOpacity
                    style={sharedStyles.greyButton}
                    onPress={() => navigation.navigate("FeedbackDataScreen")}>
                    <Text style={sharedStyles.buttonText}>Review Feedback</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
    textAlign: "center",
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
    width: 40,
    height: 40,
    borderRadius: 30,
  },
  outerBorder: {
    borderColor: "#FFD700",
    borderWidth: 3,
    borderRadius: 30,
    padding: 2,
    marginBottom: 15,
  },
  innerBorder: {
    borderColor: "#87CEEB",
    borderWidth: 2,
    borderRadius: 30,
    overflow: "hidden",
  },
  centeredData: {
    fontSize: 16,
    lineHeight: 22,
    color: "#444",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  teamMemberProfileBox: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  teamMemberDataBox: {
    backgroundColor: "#F9F9F9",
    borderColor: "#D3D3D3",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
});
