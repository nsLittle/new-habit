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

  const [contactData, setContactData] = useState({ teammembers: [] });

  useEffect(() => {
    console.log("Fetching team membmer data");
    const fetchTeamMembersData = async () => {
      try {
        if (!token) throw new Error("Authentication token is missing.");

        if (!userNameContext) throw new Error("Username is missing.");

        const response = await fetch(
          `http://localhost:8000/teammember/${userNameContext}`,
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
        console.log(
          "Transformed team member first name: ",
          teammembers[0].firstName
        );

        setDialogMessage("Teammember fetched.");
      } catch (err) {
        console.error("Error fetching teammembers.", err);
        setDialogMessage("Error fetching teammembers.");
      }
    };
    fetchTeamMembersData();
  }, [userContext]);

  const handlePress = (selectedTeamMember) => {
    navigation.navigate("FeedbackRequestWelcomeScreen", {
      teamMember: selectedTeamMember,
    });
  };

  const sendRequest = () => {
    if (
      !userNameContext ||
      !firstNameContext ||
      !contactData.teammembers.length
    ) {
      console.error("Missing required data for email.");
      return;
    }

    contactData.teammembers.forEach((teammember) => {
      if (!teammember.email || !teammember.teamMember_id) {
        console.warn(
          `Skipping team member due to missing email or ID:`,
          teammember
        );
        return;
      }

      const subject = encodeURIComponent("Feedback Request");
      const deepLink = __DEV__
        ? `http://localhost:8081/feedback-request/${teamMemberContextId}`
        : `myapp://feedback-request/${teamMemberContextId}`;

      const body = encodeURIComponent(
        `Hello Team,\n\n${userNameContext} (${firstNameContext}) is requesting feedback.\n\nClick the link below to provide feedback:\n${deepLink}`
      );

      const emailAddresses = contactData.teammembers
        .map((member) => member.email)
        .join(",");

      const emailURL = `mailto:${emailAddresses}?subject=${subject}&body=${body}`;

      Linking.openURL(emailURL).catch((err) =>
        console.error("Error opening email:", err)
      );
    });

    console.log("Emails triggered for all team members.");
  };

  const sendEmail = (teammember) => {
    if (!teammember.teamMemberRouteEmail || !teammember.teamMemberRouteId) {
      console.warn("Missing team member email or ID.");
      return;
    }

    const subject = encodeURIComponent("Feedback Request");

    const feedbackLink = __DEV__
      ? `http://localhost:8081/feedback-request/${teammember.teamMemberRouteId}`
      : `https://your-live-app.com/feedback-request/${teammember.teamMemberRouteId}`;

    const body = encodeURIComponent(
      `Hello ${teammember.teamMemberRouteFirstName},\n\n${userNameContext} (${firstNameContext}) is requesting feedback from you.\n\nClick the link below to provide feedback:\n${feedbackLink}`
    );

    const emailURL = `mailto:${teammember.teamMemberRouteEmail}?subject=${subject}&body=${body}`;

    Linking.openURL(emailURL).catch((err) =>
      console.error("Error opening email:", err)
    );
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
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Team Feedback Request</Text>
          <Text>Send Feedback Requests to Team Members</Text>
        </View>

        <View style={styles.dataContainer}>
          {contactData.teammembers.map((teammember, index) => (
            <View style={styles.contactPersonButtonContainer} key={index}>
              <TouchableOpacity
                style={styles.contactPersonButton}
                onPress={() => {
                  console.log("Navigating with params:", {
                    teamMember: teammember,
                  });

                  navigation.navigate("FeedbackRequestWelcomeScreen", {
                    teamMember: teammember,
                  });
                }}>
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
                    {teammember.firstName} {teammember.lastName}{" "}
                    {teammember._id}
                  </Text>
                  <Text style={styles.contactName}>{teammember.email}</Text>
                  <MaterialIcons
                    name="send"
                    size={24}
                    color="black"
                    style={styles.iconSend}
                    onPress={() => {
                      console.log("Sending Email with params:", {
                        teamMemberRouteId: teammember.teamMember_id,
                        teamMemberRouteFirstName: teammember.firstName,
                        teamMemberRouteLastName: teammember.lastName,
                        teamMemberRouteEmail: teammember.email,
                        teamMemberRouteProfilePic: teammember.profilePic,
                      });
                      sendEmail({
                        teamMemberRouteId: teammember.teamMember_id,
                        teamMemberRouteFirstName: teammember.firstName,
                        teamMemberRouteLastName: teammember.lastName,
                        teamMemberRouteEmail: teammember.email,
                        teamMemberRouteProfilePic: teammember.profilePic,
                      });

                      // navigation.navigate("FeedbackRequestWelcomeScreen", {
                      //   teamMemberRouteId: teammember.teamMember_id,
                      //   teamMemberRouteFirstName: teammember.firstName,
                      //   teamMemberRouteLastName: teammember.lastName,
                      //   teamMemberRouteEmail: teammember.email,
                      //   teamMemberRouteProfilePic: teammember.profilePic,
                      // });
                    }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.buttonRow}>
            {/* <TouchableOpacity style={styles.sendButton} onPress={sendRequest}>
              <Text style={styles.sendButtonText} title="Back">
                SEND Email to Team
              </Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("ReviewScreen")}>
              <Text style={styles.backButtonText} title="Back">
                Return to Review Habit Setting
              </Text>
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
  contactName: {
    marginRight: 5,
  },
  iconSend: {
    marginLeft: 5,
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
  sendButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 300,
    height: 45,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#D3D3D3",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 300,
    height: 45,
    justifyContent: "center",
  },
  backButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
  },
});
