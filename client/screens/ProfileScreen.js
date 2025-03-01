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
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "../context/UserContext";

export default function ProfileScreen() {
  const navigation = useNavigation();

  const { userContext, setUserContext } = useContext(UserContext) || {};
  const {
    userName,
    userId,
    habitId,
    habitinput,
    descriptioninput,
    teammemberId,
    firstName,
    lastName,
    email,
    profilePic,
    token,
  } = userContext || {};

  useEffect(() => {
    if (userContext) {
      console.log("UserContext:", userContext);
      console.log("Username: ", userName);
      console.log("User Id: ", userId);
      console.log("Habit Id: ", habitId);
      console.log("Habit Input: ", habitinput);
      console.log("Description Input: ", descriptioninput);
      console.log("Teammember Id: ", teammemberId);
      console.log("First Name: ", firstName);
      console.log("Last Name: ", lastName);
      console.log("Email: ", email);
      console.log("Profile Pic: ", profilePic);
      console.log("Token: ", token);
    }
  }, [userContext]);

  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const fetchUserData = async () => {
    try {
      if (!token) {
        console.warn("Authentication token is missing. Skipping API calls.");
        return;
      }

      const [userResponse, habitsResponse, teamMemberResponse] =
        await Promise.all([
          fetch(`http://192.168.1.174:8000/user/${userName}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://192.168.1.174:8000/habit/${userName}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://192.168.1.174:8000/teammember/${userName}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      if (!userResponse.ok) throw new Error("Failed to fetch user data.");
      if (!habitsResponse.ok) throw new Error("Failed to fetch habit data.");
      if (!teamMemberResponse.ok)
        throw new Error("Failed to fetch team member data.");

      const userData = await userResponse.json();
      const habitData = await habitsResponse.json();
      const teamMemberData = await teamMemberResponse.json();

      console.log("User Data: ", userData);
      console.log("Habit Data: ", habitData);
      console.log("Habit Id: ", habitData?.habits[0]._id);
      console.log("Team Member Data: ", teamMemberData);

      setUserContext((prev) => ({
        ...prev,
        username: userData.username,
        userId: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        profilePic: userData.profilePic,
        habits: habitData.habit || [],
        habitId: habitData?.habits[0]._id,
        habitinput: habitData?.habits[0].habit,
        descriptioninput: habitData?.habits[0].description,
        teammembers: teamMemberData.teamMembers || [],
      }));
    } catch (error) {
      console.error("Error with data retrieval:", error);
    }
  };

  useEffect(() => {
    if (userName) {
      fetchUserData();
    }
  }, []);

  const profilePicUrl = isValidUrl(profilePic)
    ? profilePic
    : profilePic
    ? `http://192.168.1.174:8000/data/${profilePic.trim()}`
    : "default-image-url-here";

  const testImage =
    "https://media.wired.com/photos/5cdefc28b2569892c06b2ae4/master/w_2560%2Cc_limit/Culture-Grumpy-Cat-487386121-2.jpg";

  const sendEmail = (email) => {
    if (email) {
      const mailtoURL = `mailto:${email}`;
      Linking.openURL(mailtoURL).catch((err) =>
        console.error("Failed to open email client", err)
      );
      setDialogMessage("Failed to open email client.");
      setShowDialog(true);
    } else {
      console.error("No email address provided");
      setDialogMessage("No email address provided");
      setShowDialog(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.body}>
        <View style={styles.bodyTitleContainer}>
          <Text style={styles.bodyTitleText}>Profile</Text>
        </View>

        <View style={styles.profileDataBox}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.profilePicMain} />
          ) : null}

          <Text style={styles.bodyTitleTextSub}>{userName}</Text>

          <View style={styles.profileDetails}>
            <View style={styles.profileMain}>
              <Text style={styles.profileData}>
                {firstName} {lastName}
              </Text>
              <Text style={styles.profileData}>{email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          {/* <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditAccountScreen")}>
            <Text style={styles.editButtonText}>◀ Edit Account</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => navigation.navigate("ReviewScreen")}>
            <Text style={styles.saveButtonText}>Review Habit Settings ▶</Text>
          </TouchableOpacity>
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
  bodyTitleTextSub: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
  },
  profileDataBox: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
  profileDetails: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileMain: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  profileHabits: {
    marginBottom: 10,
  },
  profileTeams: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileData: {
    textAlign: "center",
    alignSelf: "center",
    fontSize: 16,
  },
  profilePicMain: {
    borderWidth: 5,
    borderColor: "#FFD700",
    width: 100,
    height: 100,
    marginBottom: 15,
    borderRadius: 50,
  },
  teammemberProfilePicMain: {
    borderWidth: 5,
    borderColor: "#FFD700",
    width: 50,
    height: 50,
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 50,
  },
  habitDataBox: {
    justifyContent: "center",
    alignItems: "center",
  },
  habitBox: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  teamMemberBox: {
    justifyContent: "center",
    alignItems: "center",
  },
  teamMemberDetails: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconsColumn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 80,
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
  teamMemberProfilePic: {
    borderWidth: 5,
    borderColor: "#FFD700",
    width: 40,
    height: 40,
    marginBottom: 15,
    borderRadius: 50,
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
  // editButton: {
  //   backgroundColor: "#D3D3D3",
  //   borderRadius: 25,
  //   paddingVertical: 15,
  //   paddingHorizontal: 20,
  //   alignItems: "center",
  //   width: 150,
  //   height: 45,
  //   justifyContent: "center",
  // },
  // editButtonText: {
  //   color: "black",
  //   fontSize: 12,
  //   textAlign: "center",
  //   fontWeight: "bold",
  // },
  saveButton: {
    backgroundColor: "#FFD700",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: 300,
    height: 45,
    justifyContent: "center",
  },
  saveButtonText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
});
