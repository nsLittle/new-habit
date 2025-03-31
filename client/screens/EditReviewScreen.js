// Refactored EditReviewScreen.js for consistency and edit links
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
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

export default function EditReviewScreen() {
  const navigation = useNavigation();
  const { userContext, setUserContext } = useContext(UserContext) || {};
  const { userNameContext, token, habitContextId } = userContext || {};

  const [profileData, setProfileData] = useState({ habits: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token || !userNameContext) throw new Error("Missing auth info");

        const res = await fetch(`${BASE_URL}/habit/${userNameContext}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const incomplete = data.habits.filter((h) => !h.completed);

        setProfileData({ habits: incomplete });
        setUserContext((prev) => ({
          ...prev,
          habitContextInput: incomplete[0]?.habit,
          descriptionContextInput: incomplete[0]?.description,
          habitContextId: incomplete[0]?._id,
        }));
        setIsLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserData();
  }, [userNameContext]);

  if (isLoading) {
    return (
      <View style={styles.body}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const habit = profileData.habits?.[0];

  return (
    <ScrollView contentContainerStyle={sharedStyles.container}>
      <View style={sharedStyles.body}>
        <Text style={[sharedStyles.title, { marginTop: 40 }]}>Edit Review</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Your Habit:</Text>
          <Text style={styles.value}>{habit?.habit || "Not set"}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("CreateHabitScreen")}>
            <Text style={sharedStyles.linkText}>Edit Habit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>What that looks like:</Text>
          <Text style={styles.value}>{habit?.description || "Not set"}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("HabitDescriptionScreen")}>
            <Text style={sharedStyles.linkText}>Edit Description</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Your Feedback Cadence:</Text>
          <Text style={styles.value}>{habit?.cadence || "Not set"}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("CadenceScreen")}>
            <Text style={sharedStyles.linkText}>Edit Cadence</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Your Reminder Cadence:</Text>
          {habit?.reminders?.isReminderEnabled ? (
            <Text style={styles.value}>
              {(habit.reminders.isTextReminderEnabled && "Text") ||
                (habit.reminders.isEmailReminderEnabled && "Email") ||
                "Reminder"}{" "}
              on {habit.reminders.selectedDays?.join(", ") || "-"} at{" "}
              {habit.reminders.selectedTime?.hour || "--"}:
              {String(habit.reminders.selectedTime?.minute || "00").padStart(
                2,
                "0"
              )}{" "}
              {habit.reminders.selectedTime?.period || "--"}
            </Text>
          ) : (
            <Text style={styles.value}>Not set</Text>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate("ReminderScreen")}>
            <Text style={sharedStyles.linkText}>Edit Reminder</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={sharedStyles.yellowButton}
          onPress={() => navigation.navigate("ReviewScreen")}>
          <Text style={sharedStyles.buttonText}>Save ▶</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // container: {
  //   flexGrow: 1,
  //   backgroundColor: "white",
  //   paddingHorizontal: wp("5%"),
  // },
  // body: {
  //   alignItems: "center",
  //   paddingTop: Platform.OS === "web" ? hp("15%") : hp("5%"),
  //   paddingBottom: 60,
  // },
  // title: {
  //   fontSize: 26,
  //   fontWeight: "bold",
  //   marginTop: 80,
  //   marginBottom: 30,
  // },
  section: {
    marginBottom: 20,
    width: wp("85%"),
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  value: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  // link: {
  //   fontSize: 12,
  //   color: "#6A8CAF",
  //   textDecorationLine: "underline",
  //   textAlign: "center",
  //   fontWeight: "bold",
  // },
  // saveButton: {
  //   backgroundColor: "#FFD700",
  //   borderRadius: 25,
  //   paddingVertical: 15,
  //   paddingHorizontal: 20,
  //   alignItems: "center",
  //   width: 300,
  //   height: 45,
  //   justifyContent: "center",
  //   marginTop: 40,
  // },
  // saveButtonText: {
  //   color: "black",
  //   fontSize: 12,
  //   textAlign: "center",
  // },
});
