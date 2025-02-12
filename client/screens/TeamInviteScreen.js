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
import { Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Portal, Dialog, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../context/UserContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function TeamInviteScreen() {
  const { userContext, setUserContext } = useContext(UserContext);
  const { username } = userContext || {};
  console.log("Username: ", username);

  const navigation = useNavigation();

  const [error, setError] = useState(null);

  const [contactData, setContactData] = useState({ teammembers: [] });
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

  useEffect(() => {
    const fetchTeamMembersData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) throw new Error("Authentication token is missing.");

        const { username } = userContext || {};
        if (!username) throw new Error("Username is missing.");

        const response = await fetch(
          `http://192.168.1.174:8000/teammember/${username}`,
          {
            headers: {
              "Content-Type": `application/json`,
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok)
          throw new Error(
            `Failed to fetch team data. Status: ${response.status}`
          );

        const data = await response.json();
        console.log("Raw API Response:", data);

        const teammembers = Array.isArray(data.teamMembers)
          ? data.teamMembers.map((member) => ({
              teamMember_id: member._id,
              firstName: member.teamMemberFirstName,
              lastName: member.teamMemberLastName,
              profilePic: member.teamMemberProfilePic,
              email: member.teamMemberEmail,
            }))
          : [];

        setContactData({ teammembers });

        console.log("Transformed team members:", teammembers);

        setDialogMessage("Teammember fetched.");
      } catch (err) {
        console.error("Error fetching teammembers.", err);
        setError(err.message);
        setDialogMessage("Error fetching teammembers.");
      }
    };
    fetchTeamMembersData();
  }, [userContext]);

  const sendEmail = (email) => {
    if (email) {
      const mailtoURL = `mailto:${email}`;
      Linking.openURL(mailtoURL).catch((err) =>
        console.error("Failed to open email client", err)
      );
      setDialogMessage("Failed to open email client.");
      setDialogVisible(true);
    } else {
      console.error("No email address provided");
      setDialogMessage("No email address provided");
      setDialogVisible(true);
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
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Team Invite</Text>
        </View>

        <View style={styles.dataContainer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.addPersonButton}
              onPress={() => navigation.navigate("AddTeammemberScreen")}>
              <Text style={styles.addPersonButtonText}>+ Add a person</Text>
            </TouchableOpacity>
          </View>

          {contactData.teammembers.map((teammember, index) => (
            <View style={styles.buttonContainer} key={index}>
              <TouchableOpacity style={styles.contactPersonButton}>
                {teammember.profilePic ? (
                  <Image
                    source={{ uri: teammember.profilePic }}
                    style={styles.profileImage}
                    onError={(error) =>
                      console.error("Image Load Error:", error?.nativeEvent)
                    }
                  />
                ) : (
                  <Text style={styles.profileData}>
                    No profile picture available.
                  </Text>
                )}
                <View style={styles.contactPersonNameColumn}>
                  <Text style={styles.contactName}>
                    {teammember.firstName} {teammember.lastName} {teammember.id}
                  </Text>
                  <Text style={styles.contactEmail}>{teammember.email}</Text>
                </View>
                <View style={styles.iconsColumn}>
                  <MaterialIcons
                    name="send"
                    size={24}
                    color="black"
                    style={styles.iconSend}
                    onPress={() => sendEmail(teammember.teamMemberEmail)}
                  />
                  <MaterialIcons
                    name="edit"
                    size={24}
                    color="black"
                    style={styles.iconEdit}
                    onPress={() =>
                      navigation.navigate("EditTeammemberScreen", {
                        teamMember_id: teammember.teamMember_id,
                        firstName: teammember.firstName,
                        lastName: teammember.lastName,
                        email: teammember.email,
                        profilePic: teammember.profilePic,
                      })
                    }
                  />
                  <MaterialIcons
                    name="delete"
                    size={24}
                    color="black"
                    style={styles.iconDelete}
                    onPress={() => {
                      setDialogMessage(
                        "ARE YOU SURE YOU WANT TO DLETE YOUR TEAM MEMBER?"
                      );
                      // console.log(`Delete contact: ${teammember}`);
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("HabitDescriptionScreen")}>
              <Text style={styles.backButtonText} title="Back">
                ◀ Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => navigation.navigate("CadenceScreen")}>
              <Text style={styles.nextButtonText} title="Next">
                Next ▶
              </Text>
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
    paddingTop: Platform.OS === "web" ? hp("15%") : hp("2%"),
  },
  titleText: {
    fontSize: 26,
    textAlign: "center",
    paddingBottom: 30,
    fontWeight: "bold",
  },
  dataContainer: {
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: 50,
  },
  addPersonButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 25,
    marginBottom: 5,
    width: 350,
    height: 45,
    flexDirection: "row",
  },
  contactPersonButton: {
    backgroundColor: "#F8F8F8",
    borderColor: "#D3D3D3",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginTop: 15,
    marginBottom: 5,
    width: 350,
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactPersonNameColumn: {
    flexDirection: "row",
    alignItem: "center",
    justifyContent: "space-around",
  },
  contactEmail: {
    fontSize: 10,
    color: "gray",
  },

  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconsColumn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 80,
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
  nextButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 150,
    height: 45,
    justifyContent: "center",
  },
  nextButtonText: {
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
