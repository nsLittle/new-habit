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
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";
import { sharedStyles } from "../styles/sharedStyles";

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
        "Data: ", data;
        setExistingCadence(foundCadence);

        if (
          foundCadence &&
          typeof foundCadence === "string" &&
          foundCadence.trim() !== ""
        ) {
          setCadenceInput(foundCadence);
          setExistingCadence(foundCadence);
          setIncompleteHabit(incompleteHabit);
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

      setDialogMessage("Feedback cadence updated successfully.");
      navigation.navigate("ReminderScreen");
    } catch (error) {
      console.error("Error updating feedback cadence:", error);
      setDialogMessage("Failed to update feedback cadence. Please try again.");
    }
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
                  labelStyle={sharedStyles.dialogButtonCancel}>
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
                  labelStyle={sharedStyles.dialogButtonCancel}>
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

      <View style={sharedStyles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={sharedStyles.title}>Feedback Cadence</Text>
          <Text style={sharedStyles.bodyText}>
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
          <View style={sharedStyles.buttonRow}>
            <TouchableOpacity
              style={sharedStyles.yellowButton}
              onPress={handleSave}>
              <Text style={sharedStyles.buttonText}>Save ▶</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dialogTitle: {
    color: "red",
    fontWeight: "bold",
  },
  dialogButton: {
    color: "green",
    fontWeight: "bold",
    fontSize: 18,
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
});
