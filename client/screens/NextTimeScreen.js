import { useContext, useEffect, useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Button, Dialog, Portal } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../constants/config";
import { UserContext } from "../context/UserContext";

export default function NextTimeScreen() {
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
    habitContextEndDate,
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
      console.log("Habit End Date Context: ", habitContextEndDate);
      console.log("Description Input Context: ", descriptionContextInput);
      console.log("TeamMember Id Context: ", teamMemberContextId);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);

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
                  EDIT
                </Button>
                <Button
                  onPress={() => {
                    setShowDialog(false);
                    navigation.navigate("HabitDescriptionScreen");
                  }}
                  labelStyle={styles.dialogButton}>
                  KEEP
                </Button>
              </>
            ) : (
              <Button
                onPress={() => {
                  setShowDialog(false);
                  if (dialogAction === "navigate") {
                    navigation.navigate("HabitDescriptionScreen");
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
        <Text style={styles.bodyTitleText}>
          Better habit formation next time
        </Text>
        <Text style={styles.bodyTitleText}>
          Forming a habit is a continuous process.
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => navigation.navigate("LogoutScreen")}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  wrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
    overflow: Platform.OS === "web" ? "auto" : "visible",
  },
  flatList: {
    flexGrow: 1,
    height: "100%",
  },
  listContainer: {
    padding: 20,
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 18,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    paddingHorizontal: wp("5%"),
  },
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
  body: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: hp("10%"),
    backgroundColor: "white",
  },
  bodyTitleText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
  },
});
