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
import { Button, Dialog, Portal } from "react-native-paper";
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

  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");

  const [reminderProfile, setReminderProfile] = useState({
    isReminderEnabled: false,
    isEmailReminderEnabled: false,
    isTextReminderEnabled: false,
    selectedDays: [],
  });

  const [existingReminderProfile, setExistingReminderProfile] = useState({
    isReminderEnabled: false,
    isEmailReminderEnabled: false,
    isTextReminderEnabled: false,
    selectedDays: [],
    selectedHour: "",
    selectedMinute: "",
  });

  const toggleReminderSwitch = (value) => {
    setReminderProfile((prev) => ({
      ...prev,
      isReminderEnabled: value,
      isEmailReminderEnabled: value ? prev.isEmailReminderEnabled : false,
      isTextReminderEnabled: value ? prev.isTextReminderEnabled : false,
      selectedDays: value ? prev.selectedDays : [],
      selectedHour: value ? prev.selectedHour : "",
      selectedMinute: value ? prev.selectedMinute : "",
    }));
  };

  const toggleEmailSwitch = (value) => {
    if (reminderProfile.isReminderEnabled) {
      setReminderProfile((prev) => ({
        ...prev,
        isEmailReminderEnabled: value,
      }));
    } else {
      setDialogMessage("Would you like to enable reminders first?");
      setShowDialog(true);
    }
  };

  const toggleTextSwitch = (value) => {
    if (reminderProfile.isReminderEnabled) {
      setReminderProfile((prev) => ({
        ...prev,
        isTextReminderEnabled: value,
      }));
    } else {
      setDialogMessage("Would you like to enable reminders first?");
      setShowDialog(true);
    }
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toggleDay = (day) => {
    setReminderProfile((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day) // Remove day
        : [...prev.selectedDays, day], // Add day
    }));
  };

  const generateOptions = (range) => Array.from({ length: range }, (_, i) => i);

  useEffect(() => {
    const checkForExistingReminder = async () => {
      console.log(`Checking for existing reminder...`);

      try {
        const response = await fetch(
          `http://192.168.1.174:8000/habit/${username}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error("No existing reminder found.");
          return false;
        }

        const data = await response.json();
        const existingReminder = data.habits[0]?.reminders || {
          isReminderEnabled: false,
          isEmailReminderEnabled: false,
          isTextReminderEnabled: false,
          selectedDays: [],
          selectedHour: "",
          selectedMinute: "",
        };
        console.log("Data: ", data);
        console.log("Existing Reminders: ", existingReminder);

        setReminderProfile(existingReminder);

        if (existingReminder) {
          setDialogMessage(
            "ARE YOU SURE YOU WANT TO EDIT YOUR REMINDER SETTING?\n\nPress 'Keep Setting' if you want to retain your current reminder settings."
          );
          setShowDialog(true);
        }
      } catch (error) {
        console.error("Error checking existing reminders:", error);
      }
    };
    checkForExistingReminder();
  }, []);

  const handleSave = async () => {
    console.log("I'm here to save reminders....");
    if (!reminderProfile.isReminderEnabled) {
      setDialogMessage("Are you certain you don't want reminders?");
      setShowDialog(true);
      return;
    }

    try {
      console.log("Saving reminders...");
      console.log(
        "Request Body:",
        JSON.stringify(
          {
            reminders: {
              isReminderEnabled: reminderProfile.isReminderEnabled,
              isEmailReminderEnabled: reminderProfile.isEmailReminderEnabled,
              isTextReminderEnabled: reminderProfile.isTextReminderEnabled,
              selectedDays: reminderProfile.selectedDays,
              selectedTime: {
                hour: selectedHour || "",
                minute: selectedMinute || "",
              },
            },
          },
          null,
          2
        )
      );

      const response = await fetch(
        `http://192.168.1.174:8000/habit/${username}/${habitId}/reminder`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reminders: {
              isReminderEnabled: reminderProfile.isReminderEnabled,
              isEmailReminderEnabled: reminderProfile.isEmailReminderEnabled,
              isTextReminderEnabled: reminderProfile.isTextReminderEnabled,
              selectedDays: reminderProfile.selectedDays,
              selectedTime: {
                hour: selectedHour || "0",
                minute: selectedMinute || "0",
              },
            },
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data: ", data);

      setDialogMessage("Reminder settings updated successfully.");
      setShowDialog(true);
      navigation.navigate("ReviewScreen");
    } catch (error) {
      console.error("Error updating reminder settings:", error);
      setDialogMessage("Failed to update reminder settings. Please try again.");
    }
  };

  const resetToExisting = () => {
    setReminderProfile({ ...existingReminderProfile });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={{ backgroundColor: "white" }}>
          <Dialog.Title style={{ color: "red", fontWeight: "bold" }}>
            Alert
          </Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              labelStyle={{ color: "green", fontWeight: "bold", fontSize: 18 }}
              onPress={() => setShowDialog(false)}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
                thumbColor={
                  reminderProfile.isReminderEnabled ? "#FFD700" : "#f4f3f4"
                }
                ios_backgroundColor="#FFD700"
                onValueChange={toggleReminderSwitch}
                value={reminderProfile.isReminderEnabled}
              />
            </View>
          </View>
        </View>

        <View style={styles.toggleSectionTwo}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Email</Text>
            <Switch
              trackColor={{ false: "#D3D3D3", true: "#81b0ff" }}
              thumbColor={
                reminderProfile.isEmailReminderEnabled ? "#FFD700" : "#f4f3f4"
              }
              ios_backgroundColor="#D3D3D3"
              onValueChange={toggleEmailSwitch}
              value={reminderProfile.isEmailReminderEnabled}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Text</Text>
            <Switch
              trackColor={{ false: "#D3D3D3", true: "#81b0ff" }}
              thumbColor={
                reminderProfile.isTextReminderEnabled ? "#FFD700" : "#f4f3f4"
              }
              ios_backgroundColor="#D3D3D3"
              onValueChange={toggleTextSwitch}
              value={reminderProfile.isTextReminderEnabled}
            />
          </View>
        </View>

        <View style={styles.daySelection}>
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.daySquare,
                reminderProfile.selectedDays.includes(day) &&
                  styles.selectedDay,
              ]}
              onPress={() => toggleDay(day)}>
              <Text style={styles.dayText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => setSelectedHour(value)}
            items={generateOptions(24).map((hour) => ({
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
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetToExisting}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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
