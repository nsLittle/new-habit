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
import { BASE_URL } from "../constants/config";
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
  const [dialogAction, setDialogAction] = useState(null);

  const [cadenceInput, setCadenceInput] = useState(null);
  const [existingCadence, setExistingCadence] = useState("");
  const [incompleteHabit, setIncompleteHabit] = useState(null);

  const handleSelectOption = (option) => {
    setCadenceInput(option);
  };

  useEffect(() => {
    const checkForExistingCadence = async () => {
      console.log(`Checking for existing cadence...`);

      try {
        const response = await fetch(`${BASE_URL}/habit/${userNameContext}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("No existing habit found.");
          setCadenceInput("");
          setExistingCadence("");
          setIncompleteHabit(null);
          return false;
        }

        const data = await response.json();

        const foundCadence = data.habits[0]?.cadence || "";
        console.log("Data: ", data);
        console.log("Existing Cadence: ", foundCadence);
        setExistingCadence(foundCadence);

        if (
          foundCadence &&
          typeof foundCadence === "string" &&
          foundCadence.trim() !== ""
        ) {
          setCadenceInput(foundCadence);
          setExistingCadence(foundCadence);
          setIncompleteHabit(incompleteHabit);

          if (foundCadence) {
            setDialogMessage("Do you want to edit your existing cadence?");
            setDialogAction("editOrSkip");
            setShowDialog(true);

            setTimeout(() => {
              setShowDialog(false);
            }, 10000);
          }
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
        `${BASE_URL}/habit/${userNameContext}/${habitContextId}/cadence`,
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
          <Dialog.Title style={styles.dialogTitle}>Confirm</Dialog.Title>
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
                    navigation.navigate("ReminderScreen");
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
                    navigation.navigate("ReminderScreen");
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
                  if (dialogAction === "navigate") {
                    navigation.navigate("ReminderScreen");
                  }
                }}
                labelStyle={styles.dialogButton}>
                OK
              </Button>
            )}
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
              onPress={() => navigation.navigate("HabitDescriptionScreen")}>
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
  dialog: {
    backgroundColor: "white",
  },
  dialogTitle: {
    color: "red",
    fontWeight: "bold",
  },
  dialogButtonNo: {
    color: "red",
    fontWeight: "bold",
    fontSize: 18,
  },
  dialogButton: {
    color: "green",
    fontWeight: "bold",
    fontSize: 18,
  },
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
    // fontWeight: "bold",
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
    // fontWeight: "bold",
  },
});
