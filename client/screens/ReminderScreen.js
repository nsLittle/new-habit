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

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");

  const [reminderProfile, setReminderProfile] = useState({
    isReminderEnabled: false,
    isEmailReminderEnabled: false,
    isTextReminderEnabled: false,
    selectedDays: [],
    selectedHour: "",
    selectedMinute: "",
    selectedPeriod: "",
  });

  const [existingReminderProfile, setExistingReminderProfile] = useState({
    isReminderEnabled: false,
    isEmailReminderEnabled: false,
    isTextReminderEnabled: false,
    selectedDays: [],
    selectedHour: "",
    selectedMinute: "",
    selectedPeriod: "",
  });

  useEffect(() => {
    if (reminderProfile.isReminderEnabled) {
      console.log("Reminder profile updated:", reminderProfile);
    }
  }, [reminderProfile.isReminderEnabled]);

  const toggleReminderSwitch = (value) => {
    if (reminderProfile.isReminderEnabled && !value) {
      setDialogMessage(
        "You already have a reminder set. Are you sure you want to disable it?"
      );
      setShowDialog(true);
    } else {
      setReminderProfile((prev) => ({
        ...prev,
        isReminderEnabled: value,
        isEmailReminderEnabled: value ? prev.isEmailReminderEnabled : false,
        isTextReminderEnabled: value ? prev.isTextReminderEnabled : false,
        selectedDays: value ? prev.selectedDays : [],
        selectedHour: value ? prev.selectedHour : "",
        selectedMinute: value ? prev.selectedMinute : "",
        selectedPeriod: value ? prev.selectedPeriod : "",
      }));
    }
  };

  const toggleEmailSwitch = (value) => {
    if (!reminderProfile.isReminderEnabled) {
      if (!showDialog) {
        setDialogMessage("Would you like to enable reminders first?");
        setShowDialog(true);
      }
      return;
    }
    setReminderProfile((prev) => ({
      ...prev,
      isEmailReminderEnabled: value,
    }));
  };

  const toggleTextSwitch = (value) => {
    if (!reminderProfile.isReminderEnabled) {
      if (!showDialog) {
        setDialogMessage("Would you like to enable reminders first?");
        setShowDialog(true);
      }
      return;
    }
    setReminderProfile((prev) => ({
      ...prev,
      isTextReminderEnabled: value,
    }));
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toggleDay = (day) => {
    if (!reminderProfile.isReminderEnabled) {
      if (!showDialog) {
        setDialogMessage("Would you like to enable reminders first?");
        setShowDialog(true);
      }
      return;
    }
    setReminderProfile((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }));
  };

  const generateOptions = (hours) =>
    Array.from({ length: hours }, (_, i) => i + 1);

  useEffect(() => {
    const checkForExistingReminder = async () => {
      console.log(`Checking for existing reminder...`);

      try {
        const response = await fetch(
          `http://localhost:8000/habit/${username}`,
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
          return;
        }

        const data = await response.json();
        const existingReminder = data.habits[0]?.reminders || {
          isReminderEnabled: false,
          isEmailReminderEnabled: false,
          isTextReminderEnabled: false,
          selectedDays: [],
          selectedTime: { hour: "", minute: "" },
          selectedPeriod: false,
        };
        console.log("Data: ", data);
        console.log("Existing Reminders: ", existingReminder.isReminderEnabled);
        console.log("Hour: ", existingReminder.selectedTime.hour);
        console.log("Minutes: ", existingReminder.selectedTime.minute);
        console.log("Period: ", existingReminder.selectedPeriod);

        setReminderProfile(existingReminder);

        if (
          existingReminder.selectedTime?.hour !== undefined &&
          existingReminder.selectedTime.hour !== ""
        ) {
          const formattedHour = existingReminder.selectedTime.hour
            .toString()
            .padStart(2, "0");
          console.log("Setting Hour to: ", formattedHour);
          setSelectedHour(
            existingReminder.selectedTime.hour.toString().padStart(2, "0")
          );
        }

        if (existingReminder.selectedTime?.minute !== undefined) {
          setSelectedMinute(
            existingReminder.selectedTime.minute.toString().padStart(2, "0")
          );
        }

        if (existingReminder.selectedTime?.period !== undefined) {
          setSelectedPeriod(String(existingReminder.selectedTime.period));
        }

        if (existingReminder.isReminderEnabled === true) {
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
                hour: selectedHour || "00",
                minute: selectedMinute || "00",
                period: selectedPeriod || "00",
              },
            },
          },
          null,
          2
        )
      );

      const response = await fetch(
        `http://localhost:8000/habit/${userNameContext}/${habitContextId}/reminder`,
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
                hour: selectedHour || "00",
                minute: selectedMinute || "00",
                period: selectedPeriod || "AM",
              },
              selectedPeriod: reminderProfile.selectedPeriod,
            },
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response Data from Back End: ", data);

      setDialogMessage("Reminder settings updated successfully.");
      setShowDialog(true);
      navigation.navigate("TeamInviteScreen");
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
          <View style={styles.pickerItem}>
            <RNPickerSelect
              onValueChange={(value) => {
                if (reminderProfile.isReminderEnabled) {
                  console.log("Hour selected: ", value);
                  setSelectedHour(value);
                } else {
                  setDialogMessage("Would you like to enable reminders first?");
                  setShowDialog(true);
                }
              }}
              items={generateOptions(12).map((hour) => ({
                label: `${hour.toString().padStart(2, "0")}`,
                value: `${hour.toString().padStart(2, "0")}`,
              }))}
              placeholder={{ label: "Hour", value: "" }}
              value={selectedHour}
            />
          </View>
          <View style={styles.pickerItem}>
            <RNPickerSelect
              onValueChange={(value) => {
                if (reminderProfile.isReminderEnabled) {
                  console.log("Minute selected: ", value);
                  setSelectedMinute(value);
                }
              }}
              items={[
                { label: "00 minutes", value: "00" },
                { label: "15 minutes", value: "15" },
                { label: "30 minutes", value: "30" },
                { label: "45 minutes", value: "45" },
              ]}
              placeholder={{ label: "Select Minutes", value: "" }}
              value={selectedMinute}
            />
          </View>
          <View style={styles.pickerItem}>
            <RNPickerSelect
              onValueChange={(value) => {
                console.log("Period selected: ", value);
                if (reminderProfile.isReminderEnabled) {
                  setSelectedPeriod(value);
                }
              }}
              items={[
                { label: "AM", value: "AM" },
                { label: "PM", value: "PM" },
              ]}
              placeholder={{ label: "AM/PM", value: "" }}
              value={selectedPeriod}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetToExisting}>
        <Text style={styles.resetText}>Reset</Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Changes ▶</Text>
        </TouchableOpacity>
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

  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "50%",
    alignSelf: "center",
    marginVertical: 20,
  },
  pickerItem: {
    flex: 1,
    marginHorizontal: 5,
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

  resetText: {
    fontSize: 12,
    paddingTop: 15,
    color: "#6A8CAF",
    textDecorationLine: "underline",
    fontWeight: "bold",
    textAlign: "center",
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
    alignItems: "center",
    fontWeight: "bold",
  },
});
