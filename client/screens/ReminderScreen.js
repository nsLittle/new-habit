import { useContext, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

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

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);

  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");

  const [reminderProfile, setReminderProfile] = useState({
    isEmailReminderEnabled: false,
    isTextReminderEnabled: false,
    selectedDays: [],
    selectedHour: "",
    selectedMinute: "",
    selectedPeriod: "",
  });

  const [existingReminderProfile, setExistingReminderProfile] = useState({
    isEmailReminderEnabled: false,
    isTextReminderEnabled: false,
    selectedDays: [],
    selectedHour: "",
    selectedMinute: "",
    selectedPeriod: "",
  });

  const toggleEmailSwitch = (value) => {
    setReminderProfile((prev) => ({
      ...prev,
      isEmailReminderEnabled: value,
    }));
  };

  const toggleTextSwitch = (value) => {
    setReminderProfile((prev) => ({
      ...prev,
      isTextReminderEnabled: value,
    }));
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toggleDay = (day) => {
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
      if (!userNameContext || !habitContextId) {
        console.warn("User or Habit ID missing, skipping API call.");
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/habit/${userNameContext}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("No existing reminder found.");
          return;
        }

        const data = await response.json();
        const existingReminder = data?.habits?.[0]?.reminders || null;

        const incompleteHabit = data.habits.find((habit) => !habit.completed);
        console.log("Incomplete Habit: ", incompleteHabit);

        if (!existingReminder) {
          console.warn("No reminder data in API response.");
          return;
        }

        setReminderProfile((prev) => ({
          ...prev,
          isEmailReminderEnabled:
            existingReminder.isEmailReminderEnabled || false,
          isTextReminderEnabled:
            existingReminder.isTextReminderEnabled || false,
          selectedDays: existingReminder.selectedDays || [],
          selectedHour: existingReminder.selectedTime?.hour || "",
          selectedMinute: existingReminder.selectedTime?.minute || "",
          selectedPeriod: existingReminder.selectedTime?.period || "AM",
        }));

        setSelectedHour(
          existingReminder.selectedTime?.hour?.toString().padStart(2, "0") || ""
        );
        setSelectedMinute(
          existingReminder.selectedTime?.minute?.toString().padStart(2, "0") ||
            ""
        );
        setSelectedPeriod(existingReminder.selectedTime?.period || "AM");

        // if (
        //   existingReminder.selectedTime?.hour !== undefined &&
        //   existingReminder.selectedTime.hour !== ""
        // ) {
        //   const formattedHour = existingReminder.selectedTime.hour
        //     .toString()
        //     .padStart(2, "0");
        //   setSelectedHour(
        //     existingReminder.selectedTime.hour.toString().padStart(2, "0")
        //   );
        // }

        // if (existingReminder.selectedTime?.minute !== undefined) {
        //   setSelectedMinute(
        //     existingReminder.selectedTime.minute.toString().padStart(2, "0")
        //   );
        // }

        // if (existingReminder.selectedTime?.period !== undefined) {
        //   setSelectedPeriod(String(existingReminder.selectedTime.period));
        // }

        // if (existingReminder.isReminderEnabled === true) {
        //   setDialogMessage(
        //     "Do you want to edit your existing reminder setting?"
        //   );
        //   setDialogAction("editOrSkip");
        //   setShowDialog(true);

        //   setTimeout(() => {
        //     setShowDialog(false);
        //   }, 10000);
        // }
      } catch (error) {
        console.error("Error checking existing reminders:", error);
      }
    };
    checkForExistingReminder();
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/habit/${userNameContext}/${habitContextId}/reminder`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reminders: {
              isReminderEnabled: true,
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

      setDialogMessage("Reminder settings updated successfully.");
      setDialogAction("successfulUpdate");
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
    <ScrollView contentContainerStyle={sharedStyles.container}>
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={sharedStyles.dialog}>
          <Dialog.Title style={sharedStyles.dialogTitleAlert}>
            Confirm
          </Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage || "Are you sure?"}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            {dialogAction === "confirmNavigate" ? (
              <>
                <Button
                  onPress={() => setShowDialog(false)}
                  labelStyle={styles.dialogButtonNo}>
                  NO
                </Button>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                    navigation.navigate("TeamInviteScreen");
                  }}
                  labelStyle={styles.dialogButton}>
                  YES
                </Button>
              </>
            ) : dialogAction === "editOrSkip" ? (
              <>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                    navigation.navigate("TeamInviteScreen");
                  }}
                  labelStyle={styles.dialogButtonNo}>
                  NO
                </Button>
                <Button
                  onPress={() => setShowDialog(false)}
                  labelStyle={styles.dialogButton}>
                  YES
                </Button>
              </>
            ) : (
              <Button
                onPress={() => {
                  setShowDialog(false);
                  if (dialogAction === "successfulUpdate") {
                    navigation.navigate("TeamInviteScreen");
                  }
                }}
                labelStyle={styles.dialogButton}>
                OK
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={sharedStyles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={sharedStyles.title}>SELECT REMINDERS</Text>
          <Text style={sharedStyles.bodyText}>
            Set reminders to help you practice your behavior
          </Text>
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
                setSelectedHour(value);
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
                setSelectedMinute(value);
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
                setSelectedPeriod(value);
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

      <View style={sharedStyles.buttonRow}>
        <TouchableOpacity
          style={sharedStyles.yellowButton}
          onPress={handleSave}>
          <Text style={sharedStyles.buttonText}>Save Changes ▶</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dialogButton: {
    color: "green",
    fontWeight: "bold",
    fontSize: 18,
  },
  bodyIntroContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
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
});
