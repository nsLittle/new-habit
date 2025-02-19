import { useContext, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function ReminderScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const { username, userId, habitId, teammemberId, firstName, token } =
    userContext || {};
  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("User Name: ", username);
      console.log("User Id: ", userId);
      console.log("Habit Id: ", habitId);
      console.log("Teammember Id: ", teammemberId);
      console.log("First Name: ", firstName);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [isEmailReminderEnabled, setIsEmailReminderEnabled] = useState(false);
  const [isTextReminderEnabled, setIsTextReminderEnabled] = useState(false);

  const [selectedDays, setSelectedDays] = useState([]);

  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedSecond, setSelectedSecond] = useState(0);

  const toggleReminderSwitch = (value) => setIsReminderEnabled(value);
  const toggleEmailSwitch = (value) => setIsEmailReminderEnabled(value);
  const toggleTextSwitch = (value) => setIsTextReminderEnabled(value);

  const days = ["Su", "M", "T", "W", "Th", "F", "Sa"];

  const toggleDay = (day) => {
    setSelectedDays((prevSelectedDays) => {
      if (!prevSelectedDays.includes(day)) {
        // If the day is not already selected, add it
        return [...prevSelectedDays, day];
      }
      // If the day is already selected, return the previous state unchanged
      return prevSelectedDays;
    });
  };

  const generateOptions = (range) => Array.from({ length: range }, (_, i) => i);

  const saveReminders = async () => {
    console.log(`I'm ready to save reminder cadence!`);
    console.log("Username", username);
    console.log("Habit ID:", habitId);

    const reminderData = {
      isReminderEnabled,
      isEmailReminderEnabled,
      isTextReminderEnabled,
      selectedDays: selectedDays.join(", "),
      reminderTime: {
        hour: selectedHour,
        minute: selectedMinute,
        second: selectedSecond,
      },
    };

    console.log("Reminder Data: ", reminderData);
    console.log("Reminder Data before sending: ", JSON.stringify(reminderData));

    try {
      console.log("Ready to fetch data");
      const response = await fetch(
        `http://192.168.1.174:8000/habit/${username}/${habitId}/reminder`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reminderData),
        }
      );

      const data = await response.json();
      console.log("Fetched Reminder Data: ", data);

      if (response.ok) {
        setDialogMessage("Reminder created successfully!");
        console.log("Reminder saved successfully:", data);
        setIsReminderEnabled(false);
        setIsEmailReminderEnabled(false);
        setIsTextReminderEnabled(false);
        setSelectedDays([]);
        setSelectedHour(0);
        setSelectedMinute(0);
        setSelectedSecond(0);
        navigation.navigate("ReviewScreen");
      } else {
        console.error("Failed to save reminder:", data.message);
      }
    } catch (error) {
      console.error("Error saving reminder:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>SELECT REMINDERS</Text>
          <Text style={styles.subText}>
            Set reminders to help you practice your behavior
          </Text>
        </View>

        <View style={styles.toggleSection}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Reminder</Text>
            <View style={styles.toggleLabelSwitch}>
              <Switch
                trackColor={{ false: "#D3D3D3", true: "#81b0ff" }}
                thumbColor={isReminderEnabled ? "#FFD700" : "#f4f3f4"}
                ios_backgroundColor="#FFD700"
                onValueChange={toggleReminderSwitch}
                value={isReminderEnabled}
              />
            </View>
          </View>
        </View>

        <View style={styles.toggleSectionTwo}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Email</Text>
            <Switch
              trackColor={{ false: "#D3D3D3", true: "#81b0ff" }}
              thumbColor={isEmailReminderEnabled ? "#FFD700" : "#f4f3f4"}
              ios_backgroundColor="#D3D3D3"
              onValueChange={toggleEmailSwitch}
              value={isEmailReminderEnabled}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Text</Text>
            <Switch
              trackColor={{ false: "#D3D3D3", true: "#81b0ff" }}
              thumbColor={isTextReminderEnabled ? "#FFD700" : "#f4f3f4"}
              ios_backgroundColor="#D3D3D3"
              onValueChange={toggleTextSwitch}
              value={isTextReminderEnabled}
            />
          </View>
        </View>

        <View style={styles.daySelection}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.daySquare,
                selectedDays.includes(day) && styles.selectedDay,
              ]}
              onPress={() => toggleDay(day)}>
              <Text style={styles.dayText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedHour(value)}
            items={generateOptions(10).map((hour) => ({
              label: `${hour}`,
              value: hour,
            }))}
            placeholder={{ label: "Hour", value: "0" }}
          />
          <RNPickerSelect
            onValueChange={(value) => setSelectedMinute(value)}
            items={generateOptions(60).map((minute) => ({
              label: `${minute}`,
              value: minute,
            }))}
            placeholder={{ label: "Minute", value: "0" }}
          />
          {/* <RNPickerSelect
            onValueChange={(value) => setSelectedSecond(value)}
            items={generateOptions(60).map((second) => ({
              label: `${second}`,
              value: second,
            }))}
            placeholder={{ label: "Second", value: null }}
          /> */}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("WelcomeScreen")}>
            <Text style={styles.buttonText}>◀ Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={saveReminders}>
            <Text style={styles.buttonText}>Save ▶</Text>
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
  toggleSection: {
    flexDirection: "column",
    marginVertical: 10,
    borderWidth: 1,
    borderBlockColor: "gray",
    width: 300,
    height: 30,
    justifyContent: "left",
  },
  toggleSectionTwo: {
    flexDirection: "column",
    marginVertical: 10,
    borderWidth: 1,
    borderBlockColor: "gray",
    width: 300,
    height: 60,
    justifyContent: "left",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#4a4a4a",
    alignItems: "left",
  },
  toggleLabelSwitch: {
    alignItems: "right",
  },
  daySelection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  daySquare: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  selectedDay: {
    backgroundColor: "#FFD700",
  },
  dayText: {
    fontSize: 16,
    color: "#4a4a4a",
  },
  timeContainer: {
    flexGrow: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  timeBody: {
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  timerPicker: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 150,
    width: "100%",
    borderWidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 10,
    overflow: "hidden",
  },
  timerColumn: {
    flex: 1,
    marginHorizontal: 5,
    height: 150,
  },
  timerOption: {
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: {
    fontSize: 14,
    color: "#4a4a4a",
  },
  selectedTime: {
    marginTop: 20,
    fontSize: 18,
    color: "#4a4a4a",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 15,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  saveButtonText: {
    color: "black",
    fontSize: 14,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  backButtonText: {
    color: "black",
    fontSize: 14,
    textAlign: "center",
  },
});
