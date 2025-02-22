import { useContext, useEffect, useState } from "react";
import {
  Image,
  Linking,
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
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function FeedbackRequestScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    username,
    userId,
    habitId,
    habitinput,
    teammemberId,
    firstName,
    token,
  } = userContext || {};
  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("User Name: ", username);
      console.log("User Id: ", userId);
      console.log("Habit Input: ", habitinput);
      console.log("Habit Id: ", habitId);
      console.log("Teammember Id: ", teammemberId);
      console.log("First Name: ", firstName);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const [contactData, setContactData] = useState({ teammembers: [] });

  useEffect(() => {
    const fetchTeamMembersData = async () => {
      try {
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
        console.log("Team Member ID: ", teammembers[0].teamMember_id);
        setUserContext((prev) => {
          if (prev.teamMemberId !== teammembers[0]?.teamMember_id) {
            console.log("Updating UserContext with new teamMemberId");
            return { ...prev, teamMemberId: teammembers[0]?.teamMember_id };
          }
          return prev;
        });

        setDialogMessage("Teammember fetched.");
      } catch (err) {
        console.error("Error fetching teammembers.", err);
        setDialogMessage("Error fetching teammembers.");
      }
    };
    fetchTeamMembersData();
  }, [userContext]);

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
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Team Feedback Request</Text>
        </View>

        <View style={styles.dataContainer}>
          {contactData.teammembers.map((teammember, index) => (
            <View style={styles.contactPersonButtonContainer} key={index}>
              <TouchableOpacity style={styles.contactPersonButton}>
                <View style={styles.contactPersonNameColumn}>
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
                  <Text style={styles.contactName}>
                    {teammember.firstName} {teammember.lastName} {teammember.id}
                  </Text>
                  <Text style={styles.contactName}>{teammember.email}</Text>
                  {/* <View style={styles.iconsColumn}> */}
                  <MaterialIcons
                    name="send"
                    size={24}
                    color="black"
                    style={styles.iconSend}
                    onPress={() => {
                      console.log("Navigating with params:", {
                        teamMember_id: teammember.teamMember_id,
                        teamMemberFirstName: teammember.firstName,
                        teamMemberLastName: teammember.lastName,
                        teamMemberEmail: teammember.email,
                        teamMemberProfilePic: teammember.profilePic,
                      });

                      navigation.navigate("FeedbackRequestTwoScreen", {
                        teamMember_id: teammember.teamMember_id,
                        teamMemberFirstName: teammember.firstName,
                        teamMemberLastName: teammember.lastName,
                        teamMemberEmail: teammember.email,
                        teamMemberProfilePic: teammember.profilePic,
                      });
                    }}
                  />
                  {/* </View> */}
                </View>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("ReviewScreen")}>
              <Text style={styles.backButtonText} title="Back">
                ◀ Back
              </Text>
            </TouchableOpacity>
            {/* 
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => navigation.navigate("FeedbackRequestTwoScreen")}>
              <Text style={styles.nextButtonText} title="Next">
                Next ▶
              </Text>
            </TouchableOpacity> */}
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
