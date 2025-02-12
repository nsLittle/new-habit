import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect, useContext } from "react";
import { Portal, Dialog, Button } from "react-native-paper";
import { UserContext } from "../context/UserContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function CadenceScreen() {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const showDialog = (message, callback = null) => {
    setDialogMessage(message);
    setDialogVisible(true);

    if (callback) {
      setTimeout(() => {
        callback();
      }, 1000);
    }
  };
  const { userContext, setUserContext } = useContext(UserContext) || {};
  const { username, userId, habitId, token } = userContext || {};
  console.log("UserContext:", userContext);
  console.log("Username: ", username);
  console.log("UserId: ", userId);
  console.log("HabitId: ", habitId);
  console.log("Token: ", token);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
  };

  const handleSave = async () => {
    if (!selectedOption) {
      showDialog("Please select a feedback cadence.");
      return;
    }

    try {
      const response = await fetch(
        `http://192.168.1.174:8000/habit/${username}/${habitId}/detailed-habit`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            feedbackCadence: selectedOption,
            userId: userId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      showDialog("Feedback cadence updated successfully.", () => {
        navigation.navigate("ReminderScreen");
      });
    } catch (error) {
      console.error("Error updating feedback cadence:", error);
      showDialog("Failed to update feedback cadence. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Alert</Dialog.Title>
          <Dialog.Content>
            <Text>{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setDialogVisible(false)}
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
                  selectedOption === option && styles.optionBubbleSelected,
                ]}
                onPress={() => handleSelectOption(option)}>
                <View
                  style={[
                    styles.checkCircle,
                    selectedOption === option && styles.checkCircleSelected,
                  ]}
                />
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <View style={styles.bodyIntroContainer}>
          <Text style={styles.bodyIntroText}>Stuff and stuff</Text>

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
