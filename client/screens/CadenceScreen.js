import { useContext, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function CadenceScreen() {
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

  const [cadenceInput, setCadenceInput] = useState(null);
  const [existingCadence, setExistingCadence] = useState("");

  const handleSelectOption = (option) => {
    setCadenceInput(option);
  };

  useEffect(() => {
    const checkForExistingCadence = async () => {
      console.log(`Checking for existing cadence...`);

      try {
        const response = await fetch(
          `http://192.168.1.174:8000/habit/${userNameContext}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error("No existing habit found.");
          setCadenceInput("");
          setExistingCadence("");
          return;
        }

        const data = await response.json();
        const existingCadence = data.habits[0]?.cadence || "";
        console.log("Data: ", data);
        console.log("Existing Cadence: ", existingCadence);

        if (
          existingCadence &&
          typeof existingCadence === "string" &&
          existingCadence.trim() !== ""
        ) {
          setCadenceInput(existingCadence);
          setExistingCadence(existingCadence);
          setDialogMessage(
            "ARE YOU SURE YOU WANT TO EDIT YOUR CADENCE?\n\nPress 'Keep Cadence' if you want to retain your current cadence."
          );
          setShowDialog(true);
        }
      } catch (error) {
        console.error("Error checking existing cadence:", error);
      }
    };
    checkForExistingCadence();
  }, []);

  const handleSave = async () => {
    if (!cadenceInput) {
      showDialog("Please select a feedback cadence.");
      return;
    }

    try {
      console.log("Saving cadence...");
      const response = await fetch(
        `http://192.168.1.174:8000/habit/${userNameContext}/${habitContextId}/cadence`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cadence: cadenceInput,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data: ", data);

      setDialogMessage("Feedback cadence updated successfully.");
      navigation.navigate("ReminderScreen");
    } catch (error) {
      console.error("Error updating feedback cadence:", error);
      setDialogMessage("Failed to update feedback cadence. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Portal>
        <Dialog
          visible={showDialog}
          onDismiss={() => setShowDialog(false)}
          style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Alert</Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setShowDialog(false)}
              labelStyle={styles.dialogButton}>
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>Feedback Cadence</Text>
          <Text style={styles.subText}>
            How often would you like feedback from your team?
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {["Weekly", "Every Other Week", "Monthly", "Quarterly"].map(
            (option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionBubble,
                  cadenceInput === option && styles.optionBubbleSelected,
                ]}
                onPress={() => handleSelectOption(option)}>
                <View
                  style={[
                    styles.checkCircle,
                    cadenceInput === option && styles.checkCircleSelected,
                  ]}
                />
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <View style={styles.bodyIntroContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("WelcomeScreen")}>
              <Text style={styles.backButtonText}>◀ Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save ▶</Text>
            </TouchableOpacity>
          </View>
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
  subText: {
    fontSize: 18,
    paddingBottom: 30,
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
  optionsContainer: {
    marginBottom: 30,
  },
  optionBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    marginBottom: 10,
    width: 400,
  },
  optionBubbleSelected: {
    borderColor: "#FFD700",
    backgroundColor: "#FFF8DC",
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
    color: "black",
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "white",
  },
  checkCircleSelected: {
    borderColor: "#FFD700",
    backgroundColor: "#FFD700",
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
  dialog: {
    backgroundColor: "white",
  },
  dialogTitle: {
    color: "red",
    fontWeight: "bold",
  },
  dialogButton: {
    color: "green",
    fontWeight: "bold",
    fontSize: 18,
  },
});
