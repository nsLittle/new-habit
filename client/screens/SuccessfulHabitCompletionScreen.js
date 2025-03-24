import React from "react";
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

export default function SuccessfulHabitCompletionScreen() {
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
        <Text style={styles.bodyTitleText}>SUCCESS!!!!!</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.saveButton} onPress={saveHabit}>
            <Text style={styles.buttonText}>WOW</Text>
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
    overflow: Platform.OS === "web" ? "auto" : "visible", // ✅ Fixes Web scrolling
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
});
